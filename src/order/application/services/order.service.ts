import { HttpStatus, Inject, Injectable, Logger } from "@nestjs/common";
import SymbolsAddress from "../../../address/symbols-address";
import SymbolsAnalytics from "../../../analytics/symbols-analytics";
import SymbolsCart from "../../../cart/symbols-cart";
import SymbolsCatalogs from "../../../catalogs/symbols-catalogs";
import { TypeRoles } from "../../../core/domain/enums/type-roles.enum";
import { BaseErrorException } from "../../../core/domain/exceptions/base.error.exception";
import { IUserRepository } from "../../../core/domain/repositories/user.interface.repository";
import { PaginatedResponse } from "../../../core/domain/response/find-all-paginated.response";
import SymbolsProduct from "../../../product/symbols-product";
import SymbolsUser from "../../../user/symbols-user";
import { OrderStatus, STOCK_RESTORING_STATUSES } from "../../domain/enum/order-status.enum";
import { ShippingType } from "../../domain/enum/shipping-type.enum";
import { OrderItemModel } from "../../domain/models/order-item.model";
import { OrderModel } from "../../domain/models/order.model";
import { IAddressRepository } from "../../domain/repositories/address.interface.repository";
import { ICartRepository } from "../../domain/repositories/cart.interface.repository";
import { ICatOrderStatusRepository } from "../../domain/repositories/cat-order-status.interface.repository";
import { ICatPaymentMethodRepository } from "../../domain/repositories/cat-payment-method.interface.repository";
import { IMetricsRepository } from "../../domain/repositories/metrics.interface.repository";
import { IOrderRepository } from "../../domain/repositories/order.interface.repository";
import { IProductRepository } from "../../domain/repositories/product.interface.repository";
import { IOrderService } from "../../domain/services/order.interface.service";
import { IStockReservationService } from "../../domain/services/stock-reservation.interface.service";
import { ICreateOrder, IOrderCartItem, IOrderFilterOptions, IOrderLine, IOrderStatusRef } from "../../domain/types/order.type";
import SymbolsOrder from "../../symbols-order";

@Injectable()
export class OrderService implements IOrderService {
    private readonly logger = new Logger(OrderService.name);

    constructor(
        @Inject(SymbolsOrder.IOrderRepository)
        private readonly orderRepository: IOrderRepository,
        @Inject(SymbolsCart.ICartRepository)
        private readonly cartRepository: ICartRepository,
        @Inject(SymbolsProduct.IProductRepository)
        private readonly productRepository: IProductRepository,
        @Inject(SymbolsAddress.IAddressRepository)
        private readonly addressRepository: IAddressRepository,
        @Inject(SymbolsCatalogs.ICatPaymentMethodRepository)
        private readonly catPaymentMethodRepository: ICatPaymentMethodRepository,
        @Inject(SymbolsCatalogs.ICatOrderStatusRepository)
        private readonly catOrderStatusRepository: ICatOrderStatusRepository,
        @Inject(SymbolsUser.IUserRepository)
        private readonly userRepository: IUserRepository,
        @Inject(SymbolsAnalytics.IMetricsRepository)
        private readonly metricsRepository: IMetricsRepository,
        @Inject(SymbolsOrder.IStockReservationService)
        private readonly stockReservation: IStockReservationService,
    ) { }

    async create(userId: string, order: ICreateOrder): Promise<OrderModel> {
        const cart = await this.cartRepository.findByUser(userId);

        if (!cart || !cart.items.length) {
            throw new BaseErrorException('Cart is empty', HttpStatus.BAD_REQUEST);
        }

        const paymentMethod = await this.catPaymentMethodRepository.findById(order.paymentMethod);
        if (!paymentMethod) {
            throw new BaseErrorException('Payment method not found', HttpStatus.NOT_FOUND);
        }

        // Revalidate every line against the live catalogue: the cart snapshot may
        // be days old, so prices and availability are re-read here.
        const lines = await this.buildLines(cart.items);

        const orderModel = OrderModel.create({
            user: userId,
            shippingType: order.shippingType,
            shippingPrice: order.shippingPrice ?? 0,
            status: await this.resolveStatus(OrderStatus.PENDING),
        });
        orderModel.setPaymentMethod({ _id: paymentMethod._id });
        lines.forEach(({ product, quantity }) =>
            orderModel.addItem(
                OrderItemModel.create({
                    product: { _id: product._id },
                    name: product.name,
                    unitPrice: product.price,
                    quantity,
                }),
            ),
        );

        if (order.shippingType === ShippingType.DELIVERY) {
            orderModel.setShippingAddress(await this.resolveShippingAddress(userId, order.addressId));
        }

        const reserved = await this.stockReservation.reserve(lines);

        let createdOrder: OrderModel;
        try {
            createdOrder = await this.orderRepository.create(orderModel);
        } catch (error) {
            await this.stockReservation.release(reserved);
            throw error;
        }

        await this.cartRepository.clear(cart._id);

        this.trackSales(lines);

        return createdOrder;
    }

    async findById(id: string, requesterId: string): Promise<OrderModel> {
        const order = await this.orderRepository.findById(id);

        if (order.userId !== String(requesterId) && !(await this.isAdmin(requesterId))) {
            throw new BaseErrorException('Access denied: this order belongs to another user', HttpStatus.FORBIDDEN);
        }

        return order;
    }

    async findByUser(userId: string, options: IOrderFilterOptions): Promise<PaginatedResponse<OrderModel>> {
        return this.orderRepository.findAll({ ...(await this.withStatusId(options)), userId });
    }

    async findAll(options: IOrderFilterOptions): Promise<PaginatedResponse<OrderModel>> {
        return this.orderRepository.findAll(await this.withStatusId(options));
    }

    async changeStatus(id: string, status: OrderStatus): Promise<OrderModel> {
        const order = await this.orderRepository.findById(id);

        order.changeStatus(await this.resolveStatus(status));

        if (STOCK_RESTORING_STATUSES.includes(status)) {
            await this.stockReservation.restoreOnce(order);
        }

        return this.orderRepository.update(id, order);
    }

    async cancel(id: string, requesterId: string): Promise<OrderModel> {
        const order = await this.orderRepository.findById(id);

        if (order.userId !== String(requesterId) && !(await this.isAdmin(requesterId))) {
            throw new BaseErrorException('Access denied: this order belongs to another user', HttpStatus.FORBIDDEN);
        }

        if (order.status !== OrderStatus.PENDING) {
            throw new BaseErrorException(
                `Only pending orders can be cancelled by the customer, this one is ${order.status}`,
                HttpStatus.BAD_REQUEST,
            );
        }

        order.changeStatus(await this.resolveStatus(OrderStatus.CANCELLED));
        await this.stockReservation.restoreOnce(order);

        return this.orderRepository.update(id, order);
    }

    /**
     * The catalogue row behind a code. A missing row is a broken installation, not
     * a bad request: the codes come from the enum the seeder writes.
     */
    private async resolveStatus(code: OrderStatus): Promise<IOrderStatusRef> {
        const status = await this.catOrderStatusRepository.findByCode(code);

        if (!status) {
            throw new BaseErrorException(
                `Order status ${code} is missing from the catalogue`,
                HttpStatus.INTERNAL_SERVER_ERROR,
            );
        }

        return status;
    }

    /** Turns the status code of a filter into the id the documents carry. */
    private async withStatusId(options: IOrderFilterOptions): Promise<IOrderFilterOptions> {
        if (!options.status) return options;

        return { ...options, statusId: (await this.resolveStatus(options.status))._id };
    }

    /** Loads each product fresh and checks it can still be sold. */
    private async buildLines(items: IOrderCartItem[]): Promise<IOrderLine[]> {
        const lines: IOrderLine[] = [];

        for (const item of items) {
            const product = await this.productRepository.findById(item.productId);

            if (!product) {
                throw new BaseErrorException(
                    `A product in your cart no longer exists, please review it`,
                    HttpStatus.BAD_REQUEST,
                );
            }

            if (!product.isActive) {
                throw new BaseErrorException(`Product ${product.name} is not available`, HttpStatus.BAD_REQUEST);
            }

            if (item.quantity > product.stock) {
                throw new BaseErrorException(
                    `Insufficient stock for ${product.name}: ${product.stock} available, ${item.quantity} requested`,
                    HttpStatus.BAD_REQUEST,
                );
            }

            lines.push({ product, quantity: item.quantity });
        }

        return lines;
    }

    private async resolveShippingAddress(userId: string, addressId?: string) {
        if (!addressId) {
            throw new BaseErrorException(
                'An address is required for DELIVERY orders',
                HttpStatus.BAD_REQUEST,
            );
        }

        const user = await this.userRepository.findById(userId);

        if (!user.hasAddress(addressId)) {
            throw new BaseErrorException(
                'The selected address does not belong to this user',
                HttpStatus.FORBIDDEN,
            );
        }

        const address = await this.addressRepository.findById(addressId);

        if (!address) {
            throw new BaseErrorException('Address not found', HttpStatus.NOT_FOUND);
        }

        return {
            address: address._id,
            name: address.name,
            street: address.street,
            number: address.number,
            zipCode: address.zipCode,
            description: address.description,
            floorAddress: address.floorAddress,
        };
    }

    /** Fire and forget: a metrics failure must never break a purchase. */
    private trackSales(lines: IOrderLine[]): void {
        lines.forEach(({ product, quantity }) =>
            this.metricsRepository
                .incrementSellTimes(product._id, quantity)
                .catch((error) => this.logger.warn(`Could not track sale of ${product._id}: ${error?.message}`)),
        );
    }

    private async isAdmin(userId: string): Promise<boolean> {
        const user = await this.userRepository.findById(userId);
        return (user.toJSON().roles ?? []).some((role: { name: string }) => role.name === TypeRoles.ADMIN);
    }
}
