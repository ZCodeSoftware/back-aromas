import { HttpStatus, Inject, Injectable, Logger } from "@nestjs/common";
import SymbolsAnalytics from "../../../analytics/symbols-analytics";
import SymbolsCatalogs from "../../../catalogs/symbols-catalogs";
import SymbolsCombo from "../../../combo/symbols-combo";
import { BaseErrorException } from "../../../core/domain/exceptions/base.error.exception";
import { IUserRepository } from "../../../core/domain/repositories/user.interface.repository";
import { PaginatedResponse } from "../../../core/domain/response/find-all-paginated.response";
import SymbolsProduct from "../../../product/symbols-product";
import { IPricingService } from "../../../promotion/domain/services/pricing.interface.service";
import { IPricingResult } from "../../../promotion/domain/types/pricing.type";
import SymbolsPromotion from "../../../promotion/symbols-promotion";
import SymbolsUser from "../../../user/symbols-user";
import { OrderChannel } from "../../domain/enum/order-channel.enum";
import { OrderItemType } from "../../domain/enum/order-item-type.enum";
import { OrderStatus } from "../../domain/enum/order-status.enum";
import { OrderModel } from "../../domain/models/order.model";
import { ICatOrderStatusRepository } from "../../domain/repositories/cat-order-status.interface.repository";
import { ICatPaymentMethodRepository } from "../../domain/repositories/cat-payment-method.interface.repository";
import { IComboRepository } from "../../domain/repositories/combo.interface.repository";
import { IMetricsRepository } from "../../domain/repositories/metrics.interface.repository";
import { IOrderRepository } from "../../domain/repositories/order.interface.repository";
import { IProductRepository } from "../../domain/repositories/product.interface.repository";
import { IPosService } from "../../domain/services/pos.interface.service";
import { IStockReservationService } from "../../domain/services/stock-reservation.interface.service";
import {
    ICreatePosSale,
    IOrderFilterOptions,
    IOrderStatusRef,
    IPosSaleCustomer,
    IPosSaleItem,
    IPreviewPosSale,
    ISaleLine,
} from "../../domain/types/order.type";
import { applyPricing, saleLineKey, toOrderItem, toPricingLines, toStockLines } from "../../domain/utils/sale-lines.util";
import SymbolsOrder from "../../symbols-order";

@Injectable()
export class PosService implements IPosService {
    private readonly logger = new Logger(PosService.name);

    constructor(
        @Inject(SymbolsOrder.IOrderRepository)
        private readonly orderRepository: IOrderRepository,
        @Inject(SymbolsProduct.IProductRepository)
        private readonly productRepository: IProductRepository,
        @Inject(SymbolsCombo.IComboRepository)
        private readonly comboRepository: IComboRepository,
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
        lines.forEach((line) => orderModel.addItem(toOrderItem(line)));

        // Same engine as the online checkout, so the counter can never charge a
        // different price than the storefront during a sale.
        const pricing = await this.pricing.price({
            lines: toPricingLines(lines),
            couponCode: sale.couponCode,
            userId: sale.userId ?? null,
            channel: OrderChannel.POS,
            shippingPrice: 0,
        });

        if (pricing.couponError) {
            throw new BaseErrorException(pricing.couponError, HttpStatus.BAD_REQUEST);
        }

        applyPricing(orderModel, pricing, pricing.coupon?.code);

        await this.pricing.commitUsage(pricing, sale.userId ?? null);

        let reserved: Awaited<ReturnType<IStockReservationService['reserve']>>;
        try {
            reserved = await this.stockReservation.reserve(toStockLines(lines));
        } catch (error) {
            await this.pricing.revertUsage(pricing, sale.userId ?? null);
            throw error;
        }

        let createdSale: OrderModel;
        try {
            createdSale = await this.orderRepository.create(orderModel);
        } catch (error) {
            await this.stockReservation.release(reserved);
            await this.pricing.revertUsage(pricing, sale.userId ?? null);
            throw error;
        }

        this.trackSales(lines);

        return createdSale;
    }

    /**
     * Prices a counter sale without writing anything, so the operator can read the
     * total out loud before taking the money.
     */
    async preview(sale: IPreviewPosSale): Promise<IPricingResult> {
        const lines = await this.buildLines(this.mergeItems(sale.items));

        return this.pricing.price({
            lines: toPricingLines(lines),
            couponCode: sale.couponCode,
            userId: sale.userId ?? null,
            channel: OrderChannel.POS,
            shippingPrice: 0,
        });
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

    /**
     * Sums the quantities of repeated lines into one. Keyed by type plus id, not
     * by id alone: a product and a combo live in different collections, and two
     * lines of the same combo left unmerged would each pass the stock check on
     * their own — the very bug the merge exists to prevent.
     */
    private mergeItems(items: IPosSaleItem[]): IPosSaleItem[] {
        const merged = new Map<string, IPosSaleItem>();

        items.forEach((item) => {
            const key = saleLineKey({
                itemType: item.comboId ? OrderItemType.COMBO : OrderItemType.PRODUCT,
                productId: item.productId,
                comboId: item.comboId,
            });
            const existing = merged.get(key);

            if (existing) {
                existing.quantity += item.quantity;
                return;
            }

            merged.set(key, { ...item });
        });

        return [...merged.values()];
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

    /** Loads each product or combo fresh and checks it can still be sold. */
    private async buildLines(items: IPosSaleItem[]): Promise<ISaleLine[]> {
        const lines: ISaleLine[] = [];

        for (const item of items) {
            lines.push(item.comboId ? await this.buildComboLine(item) : await this.buildProductLine(item));
        }

        return lines;
    }

    private async buildProductLine(item: IPosSaleItem): Promise<ISaleLine> {
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

        return { itemType: OrderItemType.PRODUCT, product, quantity: item.quantity };
    }

    private async buildComboLine(item: IPosSaleItem): Promise<ISaleLine> {
        const combo = await this.comboRepository.findById(item.comboId);

        if (!combo) {
            throw new BaseErrorException(`A combo in this sale no longer exists`, HttpStatus.BAD_REQUEST);
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

    /**
     * Fire and forget: a metrics failure must never break a sale. Combos are
     * flattened first, since the metrics collection is keyed by product.
     */
    private trackSales(lines: ISaleLine[]): void {
        toStockLines(lines).forEach(({ productId, quantity }) =>
            this.metricsRepository
                .incrementSellTimes(productId, quantity)
                .catch((error) => this.logger.warn(`Could not track sale of ${productId}: ${error?.message}`)),
        );
    }
}
