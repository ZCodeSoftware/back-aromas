import { HttpStatus, Inject, Injectable, Logger } from "@nestjs/common";
import SymbolsAnalytics from "../../../analytics/symbols-analytics";
import SymbolsCatalogs from "../../../catalogs/symbols-catalogs";
import { BaseErrorException } from "../../../core/domain/exceptions/base.error.exception";
import { IUserRepository } from "../../../core/domain/repositories/user.interface.repository";
import { PaginatedResponse } from "../../../core/domain/response/find-all-paginated.response";
import SymbolsProduct from "../../../product/symbols-product";
import SymbolsUser from "../../../user/symbols-user";
import { OrderChannel } from "../../domain/enum/order-channel.enum";
import { OrderStatus } from "../../domain/enum/order-status.enum";
import { OrderItemModel } from "../../domain/models/order-item.model";
import { OrderModel } from "../../domain/models/order.model";
import { ICatOrderStatusRepository } from "../../domain/repositories/cat-order-status.interface.repository";
import { ICatPaymentMethodRepository } from "../../domain/repositories/cat-payment-method.interface.repository";
import { IMetricsRepository } from "../../domain/repositories/metrics.interface.repository";
import { IOrderRepository } from "../../domain/repositories/order.interface.repository";
import { IProductRepository } from "../../domain/repositories/product.interface.repository";
import { IPosService } from "../../domain/services/pos.interface.service";
import { IStockReservationService } from "../../domain/services/stock-reservation.interface.service";
import {
    ICreatePosSale,
    IOrderFilterOptions,
    IOrderLine,
    IOrderStatusRef,
    IPosSaleCustomer,
    IPosSaleItem,
} from "../../domain/types/order.type";
import SymbolsOrder from "../../symbols-order";

@Injectable()
export class PosService implements IPosService {
    private readonly logger = new Logger(PosService.name);

    constructor(
        @Inject(SymbolsOrder.IOrderRepository)
        private readonly orderRepository: IOrderRepository,
        @Inject(SymbolsProduct.IProductRepository)
        private readonly productRepository: IProductRepository,
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

    async createSale(soldBy: string, sale: ICreatePosSale): Promise<OrderModel> {
        if (sale.userId && sale.customer) {
            throw new BaseErrorException(
                'Provide either userId or customer, not both',
                HttpStatus.BAD_REQUEST,
            );
        }

        const paymentMethod = await this.catPaymentMethodRepository.findById(sale.paymentMethod);
        if (!paymentMethod) {
            throw new BaseErrorException('Payment method not found', HttpStatus.NOT_FOUND);
        }

        const customer = await this.resolveCustomer(sale);
        // Merged before validation on purpose: a scanner emits the same product
        // twice, and two lines of 3 would each pass a stock check of 5 and only
        // fail on the second decrement.
        const lines = await this.buildLines(this.mergeItems(sale.items));

        const orderModel = OrderModel.createPosSale({
            user: sale.userId ?? null,
            customer,
            soldBy,
            status: await this.resolveStatus(OrderStatus.PAID),
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

        const reserved = await this.stockReservation.reserve(lines);

        let createdSale: OrderModel;
        try {
            createdSale = await this.orderRepository.create(orderModel);
        } catch (error) {
            await this.stockReservation.release(reserved);
            throw error;
        }

        this.trackSales(lines);

        return createdSale;
    }

    async refund(id: string): Promise<OrderModel> {
        const sale = await this.orderRepository.findById(id);

        if (sale.channel !== OrderChannel.POS) {
            throw new BaseErrorException(
                'This order was not created at the point of sale',
                HttpStatus.BAD_REQUEST,
            );
        }

        // The state machine rejects a second refund on its own: REFUNDED is terminal.
        sale.changeStatus(await this.resolveStatus(OrderStatus.REFUNDED));
        await this.stockReservation.restoreOnce(sale);

        return this.orderRepository.update(id, sale);
    }

    async findAll(options: IOrderFilterOptions): Promise<PaginatedResponse<OrderModel>> {
        const statusId = options.status ? (await this.resolveStatus(options.status))._id : undefined;

        // Forced last so this endpoint can never leak online orders.
        return this.orderRepository.findAll({ ...options, statusId, channel: OrderChannel.POS });
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

    /** Sums the quantities of repeated products into a single line. */
    private mergeItems(items: IPosSaleItem[]): IPosSaleItem[] {
        const merged = new Map<string, number>();

        items.forEach(({ productId, quantity }) =>
            merged.set(productId, (merged.get(productId) ?? 0) + quantity),
        );

        return [...merged.entries()].map(([productId, quantity]) => ({ productId, quantity }));
    }

    /**
     * A linked account is snapshotted too, so every ticket is self-describing and
     * the sales listing needs no user populate. No isActive check: a sale already
     * paid at the counter must never be blocked by an account flag.
     */
    private async resolveCustomer(sale: ICreatePosSale): Promise<IPosSaleCustomer | null> {
        if (!sale.userId) return sale.customer ?? null;

        const user = await this.userRepository.findById(sale.userId);
        const { firstName, lastName, email, phone } = user.toJSON();

        return {
            name: `${firstName ?? ''} ${lastName ?? ''}`.trim() || undefined,
            email,
            phone,
        };
    }

    /** Loads each product fresh and checks it can still be sold. */
    private async buildLines(items: IPosSaleItem[]): Promise<IOrderLine[]> {
        const lines: IOrderLine[] = [];

        for (const item of items) {
            const product = await this.productRepository.findById(item.productId);

            if (!product) {
                throw new BaseErrorException(
                    `A product in this sale no longer exists`,
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

    /** Fire and forget: a metrics failure must never break a sale. */
    private trackSales(lines: IOrderLine[]): void {
        lines.forEach(({ product, quantity }) =>
            this.metricsRepository
                .incrementSellTimes(product._id, quantity)
                .catch((error) => this.logger.warn(`Could not track sale of ${product._id}: ${error?.message}`)),
        );
    }
}
