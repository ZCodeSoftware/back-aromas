import { PricingService } from '../../../promotion/application/services/pricing.service';
import { PromotionScope } from '../../../promotion/domain/enum/promotion-scope.enum';
import { PromotionValueType } from '../../../promotion/domain/enum/promotion-value-type.enum';
import { PromotionModel } from '../../../promotion/domain/models/promotion.model';
import { OrderChannel } from '../../domain/enum/order-channel.enum';
import { OrderStatus } from '../../domain/enum/order-status.enum';
import { ShippingType } from '../../domain/enum/shipping-type.enum';
import { OrderItemModel } from '../../domain/models/order-item.model';
import { OrderModel } from '../../domain/models/order.model';
import { PosService } from './pos.service';
import { StockReservationService } from './stock-reservation.service';

const product = (over: Partial<any> = {}) => ({
    _id: 'p1',
    name: 'Vela Lavanda',
    price: 100,
    stock: 10,
    isActive: true,
    ...over,
});

/**
 * A combo as the order-side repository hands it over: already priced, with its
 * stock derived from the components and the per-combo units listed out.
 */
const combo = (over: Partial<any> = {}) => ({
    _id: 'c1',
    name: 'Combo Relax',
    price: 250,
    stock: 4,
    isActive: true,
    components: [
        { product: { _id: 'p1' }, name: 'Vela Lavanda', quantity: 2, unitPrice: 100 },
        { product: { _id: 'p2' }, name: 'Incienso', quantity: 1, unitPrice: 100 },
    ],
    ...over,
});

/** A row of cat_order_status as the catalogue repository returns it. */
const status = (code: OrderStatus) => ({ _id: `st_${code}`, code, name: code });

const promotion = (over: Partial<Record<string, any>> = {}) =>
    PromotionModel.hydrate({
        _id: 'promo1',
        name: 'Promo',
        scope: PromotionScope.ALL,
        valueType: PromotionValueType.PERCENTAGE,
        value: 10,
        isActive: true,
        usedCount: 0,
        ...over,
    });

/**
 * Real StockReservationService and real PricingService over mocked repositories:
 * the compensating paths — stock given back, coupon uses given back — are the
 * part worth exercising, and a stub of them would prove nothing.
 */
const build = (
    over: {
        products?: any;
        combos?: any;
        order?: any;
        payment?: any;
        orderStatus?: any;
        user?: any;
        metrics?: any;
        automatic?: PromotionModel[];
        byCode?: PromotionModel | null;
        promotions?: any;
    } = {},
) => {
    const productRepository = {
        findById: jest.fn().mockResolvedValue(product()),
        decrementStock: jest.fn().mockResolvedValue(true),
        incrementStock: jest.fn().mockResolvedValue(true),
        ...over.products,
    };
    const comboRepository = {
        findById: jest.fn().mockResolvedValue(combo()),
        ...over.combos,
    };
    const orderRepository = {
        create: jest.fn().mockImplementation((model: OrderModel) => Promise.resolve(model)),
        findById: jest.fn(),
        update: jest.fn().mockImplementation((_id: string, model: OrderModel) => Promise.resolve(model)),
        findAll: jest.fn().mockResolvedValue({ data: [], pagination: {} }),
        ...over.order,
    };
    const catPaymentMethodRepository = {
        findById: jest.fn().mockResolvedValue({ _id: 'pm1', name: 'CASH' }),
        ...over.payment,
    };
    const catOrderStatusRepository = {
        findByCode: jest.fn().mockImplementation((code: OrderStatus) => Promise.resolve(status(code))),
        idsByCodes: jest.fn().mockResolvedValue([]),
        ...over.orderStatus,
    };
    const userRepository = {
        findById: jest.fn().mockResolvedValue({
            toJSON: () => ({ firstName: 'Ana', lastName: 'Pérez', email: 'a@b.com', phone: '123' }),
        }),
        ...over.user,
    };
    const metricsRepository = {
        incrementSellTimes: jest.fn().mockResolvedValue(undefined),
        ...over.metrics,
    };

    const promotionRepository = {
        findActiveAutomatic: jest.fn().mockResolvedValue(over.automatic ?? []),
        findByCode: jest.fn().mockResolvedValue(over.byCode ?? null),
        consumeUse: jest.fn().mockResolvedValue(true),
        releaseUse: jest.fn().mockResolvedValue(undefined),
        ...over.promotions,
    };
    const promotionUsageRepository = {
        create: jest.fn().mockResolvedValue(undefined),
        countByUser: jest.fn().mockResolvedValue(0),
        deleteLast: jest.fn().mockResolvedValue(undefined),
    };

    const stockReservation = new StockReservationService(productRepository as any);
    const pricing = new PricingService(
        promotionRepository as any,
        promotionUsageRepository as any,
    );
    const service = new PosService(
        orderRepository as any,
        productRepository as any,
        comboRepository as any,
        catPaymentMethodRepository as any,
        catOrderStatusRepository as any,
        userRepository as any,
        metricsRepository as any,
        stockReservation,
        pricing,
    );

    return {
        service,
        productRepository,
        comboRepository,
        orderRepository,
        catPaymentMethodRepository,
        catOrderStatusRepository,
        userRepository,
        metricsRepository,
        promotionRepository,
        promotionUsageRepository,
    };
};

describe('PosService', () => {
    describe('createSale', () => {
        it('persists a PAID sale on the POS channel and takes the stock', async () => {
            const { service, orderRepository, productRepository, metricsRepository } = build();

            const sale = await service.createSale('admin1', {
                items: [{ productId: 'p1', quantity: 2 }],
                paymentMethod: 'pm1',
            });

            const json = sale.toJSON();
            expect(json.channel).toBe(OrderChannel.POS);
            expect(sale.status).toBe(OrderStatus.PAID);
            expect(sale.statusId).toBe('st_PAID');
            expect(json.shippingType).toBe(ShippingType.PICKUP);
            expect(json.soldBy).toBe('admin1');
            expect(json.totalPrice).toBe(200);
            expect(orderRepository.create).toHaveBeenCalledTimes(1);
            expect(productRepository.decrementStock).toHaveBeenCalledWith('p1', 2);
            expect(metricsRepository.incrementSellTimes).toHaveBeenCalledWith('p1', 2);
        });

        it('merges repeated products into one line before checking stock', async () => {
            const { service, productRepository } = build();

            const sale = await service.createSale('admin1', {
                items: [
                    { productId: 'p1', quantity: 3 },
                    { productId: 'p1', quantity: 4 },
                ],
                paymentMethod: 'pm1',
            });

            expect(sale.items).toHaveLength(1);
            expect(sale.items[0].quantity).toBe(7);
            expect(productRepository.decrementStock).toHaveBeenCalledTimes(1);
            expect(productRepository.decrementStock).toHaveBeenCalledWith('p1', 7);
        });

        it('catches an over-sell that only the merged quantity reveals', async () => {
            const { service, productRepository } = build({
                products: { findById: jest.fn().mockResolvedValue(product({ stock: 5 })) },
            });

            await expect(
                service.createSale('admin1', {
                    items: [
                        { productId: 'p1', quantity: 3 },
                        { productId: 'p1', quantity: 3 },
                    ],
                    paymentMethod: 'pm1',
                }),
            ).rejects.toMatchObject({ statusCode: 400 });

            expect(productRepository.decrementStock).not.toHaveBeenCalled();
        });

        it('rejects supplying both a userId and a loose customer', async () => {
            const { service, catPaymentMethodRepository } = build();

            await expect(
                service.createSale('admin1', {
                    items: [{ productId: 'p1', quantity: 1 }],
                    paymentMethod: 'pm1',
                    userId: 'u1',
                    customer: { name: 'Ana' },
                }),
            ).rejects.toMatchObject({ statusCode: 400 });

            expect(catPaymentMethodRepository.findById).not.toHaveBeenCalled();
        });

        it('derives the customer snapshot from a linked account', async () => {
            const { service } = build();

            const sale = await service.createSale('admin1', {
                items: [{ productId: 'p1', quantity: 1 }],
                paymentMethod: 'pm1',
                userId: 'u1',
            });

            expect(sale.toJSON().customer).toEqual({
                name: 'Ana Pérez',
                email: 'a@b.com',
                phone: '123',
            });
            expect(sale.userId).toBe('u1');
        });

        it('keeps an anonymous walk-in sale', async () => {
            const { service } = build();

            const sale = await service.createSale('admin1', {
                items: [{ productId: 'p1', quantity: 1 }],
                paymentMethod: 'pm1',
            });

            expect(sale.userId).toBeNull();
            expect(sale.toJSON().customer).toBeNull();
        });

        it('404s on an unknown payment method', async () => {
            const { service, productRepository } = build({
                payment: { findById: jest.fn().mockResolvedValue(null) },
            });

            await expect(
                service.createSale('admin1', {
                    items: [{ productId: 'p1', quantity: 1 }],
                    paymentMethod: 'nope',
                }),
            ).rejects.toMatchObject({ statusCode: 404 });

            expect(productRepository.decrementStock).not.toHaveBeenCalled();
        });

        it('refuses an inactive product without touching stock', async () => {
            const { service, productRepository } = build({
                products: { findById: jest.fn().mockResolvedValue(product({ isActive: false })) },
            });

            await expect(
                service.createSale('admin1', {
                    items: [{ productId: 'p1', quantity: 1 }],
                    paymentMethod: 'pm1',
                }),
            ).rejects.toMatchObject({ statusCode: 400 });

            expect(productRepository.decrementStock).not.toHaveBeenCalled();
        });

        it('gives back the first line when the second loses the stock race', async () => {
            const decrementStock = jest
                .fn()
                .mockResolvedValueOnce(true)
                .mockResolvedValueOnce(false);
            const { service, productRepository, orderRepository } = build({
                products: {
                    findById: jest
                        .fn()
                        .mockResolvedValueOnce(product({ _id: 'p1' }))
                        .mockResolvedValueOnce(product({ _id: 'p2' })),
                    decrementStock,
                },
            });

            await expect(
                service.createSale('admin1', {
                    items: [
                        { productId: 'p1', quantity: 1 },
                        { productId: 'p2', quantity: 1 },
                    ],
                    paymentMethod: 'pm1',
                }),
            ).rejects.toMatchObject({ statusCode: 400 });

            expect(productRepository.incrementStock).toHaveBeenCalledTimes(1);
            expect(productRepository.incrementStock).toHaveBeenCalledWith('p1', 1);
            expect(orderRepository.create).not.toHaveBeenCalled();
        });

        it('gives back everything reserved when the insert fails', async () => {
            const boom = new Error('write concern');
            const { service, productRepository } = build({
                order: { create: jest.fn().mockRejectedValue(boom) },
            });

            await expect(
                service.createSale('admin1', {
                    items: [{ productId: 'p1', quantity: 2 }],
                    paymentMethod: 'pm1',
                }),
            ).rejects.toBe(boom);

            expect(productRepository.incrementStock).toHaveBeenCalledWith('p1', 2);
        });
    });

    describe('createSale with combos', () => {
        it('sells a combo as one line and takes the stock of every component', async () => {
            const { service, productRepository } = build();

            const sale = await service.createSale('admin1', {
                items: [{ comboId: 'c1', quantity: 2 }],
                paymentMethod: 'pm1',
            });

            const [line] = sale.toJSON().items;
            expect(sale.items).toHaveLength(1);
            expect(line.itemType).toBe('COMBO');
            expect(line.product).toBeNull();
            expect(line.combo).toEqual({ _id: 'c1' });
            expect(line.name).toBe('Combo Relax');
            expect(line.total).toBe(500);
            // Per-combo units, snapshotted so the ticket survives an edit of the combo.
            expect(line.components).toEqual([
                { product: { _id: 'p1' }, name: 'Vela Lavanda', quantity: 2, unitPrice: 100 },
                { product: { _id: 'p2' }, name: 'Incienso', quantity: 1, unitPrice: 100 },
            ]);
            expect(productRepository.decrementStock).toHaveBeenCalledWith('p1', 4);
            expect(productRepository.decrementStock).toHaveBeenCalledWith('p2', 2);
        });

        it('merges repeated combos before checking their stock', async () => {
            const { service, productRepository } = build({
                combos: { findById: jest.fn().mockResolvedValue(combo({ stock: 3 })) },
            });

            const sale = await service.createSale('admin1', {
                items: [
                    { comboId: 'c1', quantity: 2 },
                    { comboId: 'c1', quantity: 1 },
                ],
                paymentMethod: 'pm1',
            });

            expect(sale.items).toHaveLength(1);
            expect(sale.items[0].quantity).toBe(3);
            expect(productRepository.decrementStock).toHaveBeenCalledWith('p1', 6);
        });

        it('catches an over-sell that only the merged combo quantity reveals', async () => {
            const { service, productRepository } = build({
                combos: { findById: jest.fn().mockResolvedValue(combo({ stock: 3 })) },
            });

            await expect(
                service.createSale('admin1', {
                    items: [
                        { comboId: 'c1', quantity: 2 },
                        { comboId: 'c1', quantity: 2 },
                    ],
                    paymentMethod: 'pm1',
                }),
            ).rejects.toMatchObject({ statusCode: 400 });

            expect(productRepository.decrementStock).not.toHaveBeenCalled();
        });

        it('asks for a product once when it is bought loose and inside a combo', async () => {
            const { service, productRepository } = build();

            await service.createSale('admin1', {
                items: [
                    { productId: 'p1', quantity: 1 },
                    { comboId: 'c1', quantity: 1 },
                ],
                paymentMethod: 'pm1',
            });

            // Two order lines, but a single stock movement for p1: 1 loose + 2 in the
            // combo. Two separate decrements would each pass the guard on their own.
            expect(productRepository.decrementStock).toHaveBeenCalledTimes(2);
            expect(productRepository.decrementStock).toHaveBeenCalledWith('p1', 3);
            expect(productRepository.decrementStock).toHaveBeenCalledWith('p2', 1);
        });

        it('refuses a combo whose components are no longer available', async () => {
            const { service, productRepository } = build({
                combos: { findById: jest.fn().mockResolvedValue(combo({ isActive: false })) },
            });

            await expect(
                service.createSale('admin1', {
                    items: [{ comboId: 'c1', quantity: 1 }],
                    paymentMethod: 'pm1',
                }),
            ).rejects.toMatchObject({ statusCode: 400 });

            expect(productRepository.decrementStock).not.toHaveBeenCalled();
        });

        it('tracks the sale against the component products', async () => {
            const { service, metricsRepository } = build();

            await service.createSale('admin1', {
                items: [{ comboId: 'c1', quantity: 2 }],
                paymentMethod: 'pm1',
            });

            expect(metricsRepository.incrementSellTimes).toHaveBeenCalledWith('p1', 4);
            expect(metricsRepository.incrementSellTimes).toHaveBeenCalledWith('p2', 2);
        });
    });

    describe('createSale with promotions', () => {
        it('applies an automatic promotion and stores the discount on the sale', async () => {
            const { service, promotionRepository } = build({
                automatic: [promotion({ _id: 'auto', value: 10 })],
            });

            const sale = await service.createSale('admin1', {
                items: [{ productId: 'p1', quantity: 2 }],
                paymentMethod: 'pm1',
            });

            const json = sale.toJSON();
            expect(json.subTotalPrice).toBe(200);
            expect(json.discountTotal).toBe(20);
            expect(json.totalPrice).toBe(180);
            expect(json.items[0].netTotal).toBe(180);
            expect(json.appliedPromotions).toHaveLength(1);
            expect(promotionRepository.consumeUse).toHaveBeenCalledWith('auto');
        });

        it('redeems a coupon and records the code on the sale', async () => {
            const { service, promotionUsageRepository } = build({
                byCode: promotion({ _id: 'coupon', code: 'BIENVENIDA', value: 25 }),
            });

            const sale = await service.createSale('admin1', {
                items: [{ productId: 'p1', quantity: 1 }],
                paymentMethod: 'pm1',
                couponCode: 'BIENVENIDA',
            });

            expect(sale.toJSON().coupon).toBe('BIENVENIDA');
            expect(sale.toJSON().totalPrice).toBe(75);
            expect(promotionUsageRepository.create).toHaveBeenCalledWith(
                expect.objectContaining({ promotionId: 'coupon', discount: 25 }),
            );
        });

        it('refuses the sale on an invalid coupon without touching stock', async () => {
            const { service, productRepository } = build({ byCode: null });

            await expect(
                service.createSale('admin1', {
                    items: [{ productId: 'p1', quantity: 1 }],
                    paymentMethod: 'pm1',
                    couponCode: 'NOEXISTE',
                }),
            ).rejects.toMatchObject({ statusCode: 400 });

            expect(productRepository.decrementStock).not.toHaveBeenCalled();
        });

        it('refuses the sale when the coupon just ran out, before taking stock', async () => {
            const { service, productRepository } = build({
                byCode: promotion({ _id: 'coupon', code: 'ULTIMO', value: 10 }),
                promotions: { consumeUse: jest.fn().mockResolvedValue(false) },
            });

            await expect(
                service.createSale('admin1', {
                    items: [{ productId: 'p1', quantity: 1 }],
                    paymentMethod: 'pm1',
                    couponCode: 'ULTIMO',
                }),
            ).rejects.toMatchObject({ statusCode: 400 });

            // Uses are burnt before stock on purpose: losing the last coupon must
            // not leave units reserved for a sale that never happens.
            expect(productRepository.decrementStock).not.toHaveBeenCalled();
        });

        it('gives the coupon use back when the sale cannot be written', async () => {
            const boom = new Error('write concern');
            const { service, promotionRepository, promotionUsageRepository } = build({
                byCode: promotion({ _id: 'coupon', code: 'BIENVENIDA', value: 10 }),
                order: { create: jest.fn().mockRejectedValue(boom) },
            });

            await expect(
                service.createSale('admin1', {
                    items: [{ productId: 'p1', quantity: 1 }],
                    paymentMethod: 'pm1',
                    couponCode: 'BIENVENIDA',
                }),
            ).rejects.toBe(boom);

            expect(promotionRepository.releaseUse).toHaveBeenCalledWith('coupon');
            expect(promotionUsageRepository.deleteLast).toHaveBeenCalledWith('coupon', null);
        });

        it('gives the coupon use back when the stock race is lost', async () => {
            const { service, promotionRepository } = build({
                byCode: promotion({ _id: 'coupon', code: 'BIENVENIDA', value: 10 }),
                products: {
                    findById: jest.fn().mockResolvedValue(product()),
                    decrementStock: jest.fn().mockResolvedValue(false),
                    incrementStock: jest.fn().mockResolvedValue(true),
                },
            });

            await expect(
                service.createSale('admin1', {
                    items: [{ productId: 'p1', quantity: 1 }],
                    paymentMethod: 'pm1',
                    couponCode: 'BIENVENIDA',
                }),
            ).rejects.toMatchObject({ statusCode: 400 });

            expect(promotionRepository.releaseUse).toHaveBeenCalledWith('coupon');
        });

        it('discounts a combo line through a COMBOS-scoped promotion', async () => {
            const { service } = build({
                automatic: [
                    promotion({ _id: 'auto', scope: PromotionScope.COMBOS, combos: ['c1'], value: 10 }),
                ],
            });

            const sale = await service.createSale('admin1', {
                items: [{ comboId: 'c1', quantity: 1 }],
                paymentMethod: 'pm1',
            });

            expect(sale.toJSON().discountTotal).toBe(25);
            expect(sale.toJSON().totalPrice).toBe(225);
        });
    });

    describe('preview', () => {
        it('quotes a sale without writing or reserving anything', async () => {
            const { service, productRepository, orderRepository, promotionRepository } = build({
                automatic: [promotion({ _id: 'auto', value: 10 })],
            });

            const quote = await service.preview({
                items: [{ productId: 'p1', quantity: 2 }],
            });

            expect(quote.subTotalPrice).toBe(200);
            expect(quote.discountTotal).toBe(20);
            expect(quote.totalPrice).toBe(180);
            expect(orderRepository.create).not.toHaveBeenCalled();
            expect(productRepository.decrementStock).not.toHaveBeenCalled();
            expect(promotionRepository.consumeUse).not.toHaveBeenCalled();
        });

        it('reports an invalid coupon instead of failing', async () => {
            const { service } = build({ byCode: null });

            const quote = await service.preview({
                items: [{ productId: 'p1', quantity: 1 }],
                couponCode: 'NOEXISTE',
            });

            expect(quote.couponError).toMatch(/no existe/i);
            expect(quote.totalPrice).toBe(100);
        });
    });

    describe('refund', () => {
        const paidPosSale = () => {
            const sale = OrderModel.createPosSale({ soldBy: 'admin1', status: status(OrderStatus.PAID) });
            sale.addItem(
                OrderItemModel.create({
                    product: { _id: 'p1' },
                    name: 'Vela',
                    unitPrice: 100,
                    quantity: 2,
                }),
            );

            return sale;
        };

        it('refunds a POS sale and restores its units', async () => {
            const sale = paidPosSale();
            const { service, productRepository, orderRepository } = build({
                order: {
                    findById: jest.fn().mockResolvedValue(sale),
                    update: jest.fn().mockImplementation((_id, model) => Promise.resolve(model)),
                },
            });

            const refunded = await service.refund('o1');

            expect(refunded.status).toBe(OrderStatus.REFUNDED);
            expect(refunded.stockRestored).toBe(true);
            expect(productRepository.incrementStock).toHaveBeenCalledWith('p1', 2);
            expect(orderRepository.update).toHaveBeenCalledWith('o1', sale);
        });

        it('restores the components of a refunded combo, not the combo itself', async () => {
            const sale = OrderModel.createPosSale({ soldBy: 'admin1', status: status(OrderStatus.PAID) });
            sale.addItem(
                OrderItemModel.createCombo({
                    combo: { _id: 'c1' },
                    name: 'Combo Relax',
                    unitPrice: 250,
                    quantity: 2,
                    components: [
                        { product: { _id: 'p1' }, name: 'Vela', quantity: 2, unitPrice: 100 },
                        { product: { _id: 'p2' }, name: 'Incienso', quantity: 1, unitPrice: 100 },
                    ],
                }),
            );
            const { service, productRepository } = build({
                order: { findById: jest.fn().mockResolvedValue(sale) },
            });

            const refunded = await service.refund('o1');

            expect(refunded.status).toBe(OrderStatus.REFUNDED);
            expect(productRepository.incrementStock).toHaveBeenCalledWith('p1', 4);
            expect(productRepository.incrementStock).toHaveBeenCalledWith('p2', 2);
            expect(productRepository.incrementStock).not.toHaveBeenCalledWith('c1', expect.anything());
        });

        it('refuses to refund an online order through the POS endpoint', async () => {
            const onlineOrder = OrderModel.create({
                user: 'u1',
                shippingType: ShippingType.PICKUP,
                status: status(OrderStatus.PENDING),
            });
            const { service, productRepository } = build({
                order: { findById: jest.fn().mockResolvedValue(onlineOrder) },
            });

            await expect(service.refund('o1')).rejects.toMatchObject({ statusCode: 400 });
            expect(productRepository.incrementStock).not.toHaveBeenCalled();
        });

        it('rejects a second refund and leaves stock alone', async () => {
            const sale = paidPosSale();
            const { service, productRepository } = build({
                order: { findById: jest.fn().mockResolvedValue(sale) },
            });

            await service.refund('o1');
            productRepository.incrementStock.mockClear();

            await expect(service.refund('o1')).rejects.toMatchObject({ statusCode: 400 });
            expect(productRepository.incrementStock).not.toHaveBeenCalled();
        });
    });

    describe('findAll', () => {
        it('forces the POS channel over whatever the caller asked for', async () => {
            const { service, orderRepository } = build();

            await service.findAll({ channel: OrderChannel.ONLINE, page: 2 } as any);

            expect(orderRepository.findAll).toHaveBeenCalledWith(
                expect.objectContaining({ channel: OrderChannel.POS, page: 2 }),
            );
        });
    });
});
