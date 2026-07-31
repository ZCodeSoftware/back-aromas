import { HttpStatus, Inject, Injectable, Logger } from "@nestjs/common";
import SymbolsAddress from "../../../address/symbols-address";
import SymbolsAnalytics from "../../../analytics/symbols-analytics";
import SymbolsCart from "../../../cart/symbols-cart";
import SymbolsCatalogs from "../../../catalogs/symbols-catalogs";
import SymbolsCombo from "../../../combo/symbols-combo";
import { TypeRoles } from "../../../core/domain/enums/type-roles.enum";
import { BaseErrorException } from "../../../core/domain/exceptions/base.error.exception";
import { IUserRepository } from "../../../core/domain/repositories/user.interface.repository";
import { PaginatedResponse } from "../../../core/domain/response/find-all-paginated.response";
import SymbolsProduct from "../../../product/symbols-product";
import { IPricingService } from "../../../promotion/domain/services/pricing.interface.service";
import { IPricingResult } from "../../../promotion/domain/types/pricing.type";
import SymbolsPromotion from "../../../promotion/symbols-promotion";
import SymbolsUser from "../../../user/symbols-user";
import { OrderItemType } from "../../domain/enum/order-item-type.enum";
import { OrderStatus, STOCK_RESTORING_STATUSES } from "../../domain/enum/order-status.enum";
import { ShippingType } from "../../domain/enum/shipping-type.enum";
import { OrderModel } from "../../domain/models/order.model";
import { IAddressRepository } from "../../domain/repositories/address.interface.repository";
import { ICartRepository } from "../../domain/repositories/cart.interface.repository";
import { ICatOrderStatusRepository } from "../../domain/repositories/cat-order-status.interface.repository";
import { ICatPaymentMethodRepository } from "../../domain/repositories/cat-payment-method.interface.repository";
import { IComboRepository } from "../../domain/repositories/combo.interface.repository";
import { IMetricsRepository } from "../../domain/repositories/metrics.interface.repository";
import { IOrderRepository } from "../../domain/repositories/order.interface.repository";
import { IProductRepository } from "../../domain/repositories/product.interface.repository";
import { IOrderService } from "../../domain/services/order.interface.service";
import { IStockReservationService } from "../../domain/services/stock-reservation.interface.service";
import { OrderChannel } from "../../domain/enum/order-channel.enum";
import { ICreateOrder, IOrderCartItem, IOrderFilterOptions, IOrderStatusRef, IPreviewOrder, ISaleLine } from "../../domain/types/order.type";
import { applyPricing, toOrderItem, toPricingLines, toStockLines } from "../../domain/utils/sale-lines.util";
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
        @Inject(SymbolsCombo.IComboRepository)
        private readonly comboRepository: IComboRepository,
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
        @Inject(SymbolsPromotion.IPricingService)
        private readonly pricing: IPricingService,
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
        lines.forEach((line) => orderModel.addItem(toOrderItem(line)));

        if (order.shippingType === ShippingType.DELIVERY) {
            orderModel.setShippingAddress(await this.resolveShippingAddress(userId, order.addressId));
        }

        // The coupon on the request wins over the one parked on the cart, so what
        // the buyer just typed is what gets charged.
        const couponCode = order.couponCode ?? cart.couponCode;
        const pricing = await this.pricing.price({
            lines: toPricingLines(lines),
            couponCode,
            userId,
            channel: OrderChannel.ONLINE,
            shippingPrice: order.shippingPrice ?? 0,
        });

        // A coupon that did not apply is only a warning on a preview; here it is a
        // refusal, so nobody is charged a total they never agreed to.
        if (pricing.couponError) {
            throw new BaseErrorException(pricing.couponError, HttpStatus.BAD_REQUEST);
        }

        applyPricing(orderModel, pricing, pricing.coupon?.code);

        // Uses are burnt before any stock moves: a coupon that just ran out has to
        // fail the sale while it is still free to fail.
        await this.pricing.commitUsage(pricing, userId);

        let reserved: Awaited<ReturnType<IStockReservationService['reserve']>>;
        try {
            // Combos are flattened into their components here: they carry no stock
            // of their own, and toStockLines() also merges a product bought both on
            // its own and inside a combo, so its stock is checked once in total.
            reserved = await this.stockReservation.reserve(toStockLines(lines));
        } catch (error) {
            await this.pricing.revertUsage(pricing, userId);
            throw error;
        }

        let createdOrder: OrderModel;
        try {
            createdOrder = await this.orderRepository.create(orderModel);
        } catch (error) {
            await this.stockReservation.release(reserved);
            await this.pricing.revertUsage(pricing, userId);
            throw error;
        }

        await this.cartRepository.clear(cart._id);

        this.trackSales(lines);

        return createdOrder;
    }

    /**
     * Prices the user's cart without writing anything, so the checkout can show a
     * total — and a reason a coupon was rejected — before the buyer commits.
     */
    async preview(userId: string, options: IPreviewOrder): Promise<IPricingResult> {
        const cart = await this.cartRepository.findByUser(userId);

        if (!cart || !cart.items.length) {
            throw new BaseErrorException('Cart is empty', HttpStatus.BAD_REQUEST);
        }

        return this.pricing.price({
            lines: toPricingLines(await this.buildLines(cart.items)),
            couponCode: options.couponCode ?? cart.couponCode,
            userId,
            channel: OrderChannel.ONLINE,
            shippingPrice: options.shippingPrice ?? 0,
        });
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

    /** Loads each product or combo fresh and checks it can still be sold. */
    private async buildLines(items: IOrderCartItem[]): Promise<ISaleLine[]> {
        const lines: ISaleLine[] = [];

        for (const item of items) {
            lines.push(
                item.itemType === OrderItemType.COMBO
                    ? await this.buildComboLine(item)
                    : await this.buildProductLine(item),
            );
        }

        return lines;
    }

    private async buildProductLine(item: IOrderCartItem): Promise<ISaleLine> {
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

        return { itemType: OrderItemType.PRODUCT, product, quantity: item.quantity };
    }

    /**
     * The combo arrives already priced and with its stock derived from the live
     * components, so this only has to check it is still sellable. The definitive
     * stock check happens in reserve(), which is the one that is race-safe.
     */
    private async buildComboLine(item: IOrderCartItem): Promise<ISaleLine> {
        const combo = await this.comboRepository.findById(item.comboId);

        if (!combo) {
            throw new BaseErrorException(
                `A combo in your cart no longer exists, please review it`,
                HttpStatus.BAD_REQUEST,
            );
        }

        if (!combo.isActive) {
            throw new BaseErrorException(`Combo ${combo.name} is not available`, HttpStatus.BAD_REQUEST);
        }

        if (item.quantity > combo.stock) {
            throw new BaseErrorException(
                `Insufficient stock for ${combo.name}: ${combo.stock} available, ${item.quantity} requested`,
                HttpStatus.BAD_REQUEST,
            );
        }

        return { itemType: OrderItemType.COMBO, combo, quantity: item.quantity };
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

    /**
     * Fire and forget: a metrics failure must never break a purchase. Combos are
     * flattened first, since the metrics collection is keyed by product and those
     * units did leave the shelf.
     */
    private trackSales(lines: ISaleLine[]): void {
        toStockLines(lines).forEach(({ productId, quantity }) =>
            this.metricsRepository
                .incrementSellTimes(productId, quantity)
                .catch((error) => this.logger.warn(`Could not track sale of ${productId}: ${error?.message}`)),
        );
    }

    private async isAdmin(userId: string): Promise<boolean> {
        const user = await this.userRepository.findById(userId);
        return (user.toJSON().roles ?? []).some((role: { name: string }) => role.name === TypeRoles.ADMIN);
    }
}
