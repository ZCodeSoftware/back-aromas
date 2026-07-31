import { OrderChannel } from '../../../order/domain/enum/order-channel.enum';
import { GroupBy } from '../../domain/enum/group-by.enum';
import { AnalyticsService } from './analytics.service';

const emptySummary = {
    totalOrders: 0,
    revenue: 0,
    paidOrders: 0,
    paidRevenue: 0,
    subTotal: 0,
    shipping: 0,
    ordersByStatus: [],
    topSold: [],
};

const build = (over: any = {}) => {
    const metricsRepository = {
        topBy: jest.fn().mockResolvedValue([]),
        findByProduct: jest.fn(),
        getLifetimeTotals: jest.fn().mockResolvedValue({ seeTimes: 0, sellTimes: 0, addCartTimes: 0 }),
        ...over.metrics,
    };
    const orderRepository = {
        getSalesSummary: jest.fn().mockResolvedValue(emptySummary),
        getSalesDaily: jest.fn().mockResolvedValue([]),
        getSalesBreakdown: jest.fn().mockResolvedValue([]),
        getTopCustomers: jest.fn().mockResolvedValue([]),
        getCustomerCohorts: jest.fn().mockResolvedValue({
            newCustomers: 0,
            returningCustomers: 0,
            ordersFromNew: 0,
            ordersFromReturning: 0,
            revenueFromNew: 0,
            revenueFromReturning: 0,
        }),
        getAnonymousSales: jest.fn().mockResolvedValue({ orders: 0, revenue: 0 }),
        getSoldProductIds: jest.fn().mockResolvedValue([]),
        countOrders: jest.fn().mockResolvedValue(0),
        ...over.order,
    };
    const catalogueRepository = {
        countProducts: jest.fn().mockResolvedValue(0),
        countUsers: jest.fn().mockResolvedValue(0),
        ...over.catalogue,
    };
    const inventoryRepository = {
        getStockSummary: jest.fn().mockResolvedValue({
            activeProducts: 0,
            unitsInStock: 0,
            inventoryValueAtSalePrice: 0,
            outOfStockCount: 0,
            lowStockCount: 0,
        }),
        findLowStock: jest.fn().mockResolvedValue([]),
        findOutOfStock: jest.fn().mockResolvedValue([]),
        findDeadStock: jest.fn().mockResolvedValue([]),
        getDeadStockTotals: jest.fn().mockResolvedValue({ count: 0, valueAtSalePrice: 0 }),
        ...over.inventory,
    };
    const cartRepository = {
        getCartSnapshot: jest.fn().mockResolvedValue({
            cartsWithItems: 0,
            abandonedCarts: 0,
            abandonedValueAtCartPrices: 0,
        }),
        ...over.cart,
    };
    const catPaymentMethodRepository = {
        findAllNames: jest.fn().mockResolvedValue([{ _id: 'pm1', name: 'CASH' }]),
        ...over.payment,
    };

    const service = new AnalyticsService(
        metricsRepository as any,
        orderRepository as any,
        catalogueRepository as any,
        inventoryRepository as any,
        cartRepository as any,
        catPaymentMethodRepository as any,
    );

    return { service, metricsRepository, orderRepository, inventoryRepository, cartRepository, catPaymentMethodRepository };
};

const RANGE = { dateFrom: '2026-07-01', dateTo: '2026-07-03', timezone: '-03:00' };

describe('AnalyticsService', () => {
    describe('getDashboard', () => {
        it('stays all-time when no dates are sent', async () => {
            const { service, orderRepository } = build();

            const dashboard = await service.getDashboard({});

            expect(dashboard.range).toBeNull();
            expect(orderRepository.getSalesSummary).toHaveBeenCalledWith(5, null);
        });

        it('scopes the sales block once dates arrive', async () => {
            const { service, orderRepository } = build();

            const dashboard = await service.getDashboard(RANGE);

            expect(dashboard.range).toEqual(RANGE);
            expect(orderRepository.getSalesSummary).toHaveBeenCalledWith(
                5,
                expect.objectContaining({ dateFrom: '2026-07-01', dateTo: '2026-07-03' }),
            );
        });

        it('labels engagement as lifetime, since the counters have no timestamps', async () => {
            const { service } = build();

            const dashboard = await service.getDashboard({});

            expect(dashboard.engagement.scope).toBe('LIFETIME');
        });

        it('surfaces an invalid range as a 400', async () => {
            const { service } = build();

            await expect(
                service.getDashboard({ dateFrom: '2026-07-28', dateTo: '2026-07-01' }),
            ).rejects.toMatchObject({ statusCode: 400 });
        });
    });

    describe('getSalesBreakdown', () => {
        it('reports both channels even when only one sold', async () => {
            const { service } = build({
                order: {
                    getSalesBreakdown: jest.fn().mockResolvedValue([
                        {
                            channel: OrderChannel.POS,
                            paymentMethodId: 'pm1',
                            orders: 4,
                            revenue: 400,
                            paidOrders: 4,
                            paidRevenue: 400,
                        },
                    ]),
                },
            });

            const breakdown = await service.getSalesBreakdown(RANGE);

            expect(breakdown.byChannel.map((b) => b.channel)).toEqual([
                OrderChannel.ONLINE,
                OrderChannel.POS,
            ]);
            expect(breakdown.byChannel.find((b) => b.channel === OrderChannel.ONLINE)).toMatchObject({
                orders: 0,
                share: 0,
            });
            expect(breakdown.byChannel.find((b) => b.channel === OrderChannel.POS)).toMatchObject({
                orders: 4,
                share: 100,
            });
        });

        it('resolves payment-method names and keeps shares summing to 100', async () => {
            const { service } = build({
                order: {
                    getSalesBreakdown: jest.fn().mockResolvedValue([
                        { channel: 'ONLINE', paymentMethodId: 'pm1', orders: 3, revenue: 300, paidOrders: 3, paidRevenue: 300 },
                        { channel: 'POS', paymentMethodId: 'pm1', orders: 1, revenue: 100, paidOrders: 1, paidRevenue: 100 },
                    ]),
                },
            });

            const breakdown = await service.getSalesBreakdown(RANGE);

            expect(breakdown.byPaymentMethod).toHaveLength(1);
            expect(breakdown.byPaymentMethod[0]).toMatchObject({ name: 'CASH', orders: 4, share: 100 });
            expect(breakdown.totals).toMatchObject({ orders: 4, revenue: 400 });
        });

        it('keeps a bucket whose payment method no longer exists', async () => {
            const { service } = build({
                order: {
                    getSalesBreakdown: jest.fn().mockResolvedValue([
                        { channel: 'POS', paymentMethodId: 'deleted', orders: 1, revenue: 100, paidOrders: 1, paidRevenue: 100 },
                        { channel: 'POS', paymentMethodId: null, orders: 1, revenue: 50, paidOrders: 1, paidRevenue: 50 },
                    ]),
                },
            });

            const breakdown = await service.getSalesBreakdown(RANGE);

            expect(breakdown.byPaymentMethod.map((b) => b.name)).toEqual(['UNKNOWN', 'UNKNOWN']);
            const totalShare = breakdown.byPaymentMethod.reduce((acc, b) => acc + b.share, 0);
            expect(totalShare).toBeCloseTo(100, 1);
        });
    });

    describe('getSalesTimeSeries', () => {
        it('returns one zeroed point per day of the range', async () => {
            const { service } = build();

            const series = await service.getSalesTimeSeries({ ...RANGE, groupBy: GroupBy.DAY });

            expect(series.groupBy).toBe(GroupBy.DAY);
            expect(series.points.map((p) => p.bucket)).toEqual([
                '2026-07-01',
                '2026-07-02',
                '2026-07-03',
            ]);
            expect(series.totals.orders).toBe(0);
        });

        it('defaults to daily buckets', async () => {
            const { service } = build();

            const series = await service.getSalesTimeSeries(RANGE);

            expect(series.groupBy).toBe(GroupBy.DAY);
        });
    });

    describe('getInventory', () => {
        it('feeds the dead-stock anti-join with the products that moved', async () => {
            const { service, inventoryRepository } = build({
                order: { getSoldProductIds: jest.fn().mockResolvedValue(['p1', 'p2']) },
            });

            const report = await service.getInventory({ ...RANGE, lowStockThreshold: 3, limit: 5 });

            expect(inventoryRepository.findDeadStock).toHaveBeenCalledWith(['p1', 'p2'], 5);
            expect(inventoryRepository.getDeadStockTotals).toHaveBeenCalledWith(['p1', 'p2']);
            expect(inventoryRepository.getStockSummary).toHaveBeenCalledWith(3);
            expect(report.summary.lowStockThreshold).toBe(3);
            expect(report.scope).toBe('SNAPSHOT');
            expect(report.deadStock.range).toEqual(RANGE);
        });

        it('applies the documented defaults', async () => {
            const { service, inventoryRepository } = build();

            await service.getInventory(RANGE);

            expect(inventoryRepository.getStockSummary).toHaveBeenCalledWith(5);
            expect(inventoryRepository.findLowStock).toHaveBeenCalledWith(5, 20);
        });
    });

    describe('getCustomers', () => {
        it('reconciles anonymous plus customer orders against the total', async () => {
            const { service } = build({
                order: {
                    getTopCustomers: jest.fn().mockResolvedValue([
                        { userId: 'u1', orders: 6, revenue: 600, lastOrderAt: new Date() },
                        { userId: 'u2', orders: 4, revenue: 400, lastOrderAt: new Date() },
                    ]),
                    getAnonymousSales: jest.fn().mockResolvedValue({ orders: 5, revenue: 500 }),
                    getCustomerCohorts: jest.fn().mockResolvedValue({
                        newCustomers: 1,
                        returningCustomers: 1,
                        ordersFromNew: 4,
                        ordersFromReturning: 6,
                        revenueFromNew: 400,
                        revenueFromReturning: 600,
                    }),
                    countOrders: jest.fn().mockResolvedValue(15),
                },
            });

            const report = await service.getCustomers(RANGE);
            const customerOrders = report.topCustomers.reduce((acc, c) => acc + c.orders, 0);

            expect(customerOrders + report.anonymous.orders).toBe(15);
            expect(report.cohorts.ordersFromNew + report.cohorts.ordersFromReturning).toBe(customerOrders);
            expect(report.anonymous.note).toMatch(/sin una cuenta vinculada/);
        });

        it('honours the leaderboard limit', async () => {
            const { service, orderRepository } = build();

            await service.getCustomers({ ...RANGE, limit: 25 });

            expect(orderRepository.getTopCustomers).toHaveBeenCalledWith(expect.anything(), 25);
        });
    });

    describe('getConversion', () => {
        it('splits range orders into customer and anonymous', async () => {
            const { service } = build({
                order: {
                    countOrders: jest.fn().mockResolvedValue(10),
                    getAnonymousSales: jest.fn().mockResolvedValue({ orders: 3, revenue: 300 }),
                },
            });

            const report = await service.getConversion(RANGE);

            expect(report.orders).toMatchObject({
                scope: 'RANGE',
                ordersInRange: 10,
                customerOrdersInRange: 7,
                anonymousOrdersInRange: 3,
            });
        });

        it('labels the cart block a snapshot and the counters lifetime', async () => {
            const { service } = build();

            const report = await service.getConversion(RANGE);

            expect(report.carts.scope).toBe('SNAPSHOT');
            expect(report.carts.note).toMatch(/no se puede acotar a un rango de fechas/);
            expect(report.lifetime.scope).toBe('LIFETIME');
        });

        it('derives the add-to-cart rate and guards a zero divisor', async () => {
            const { service } = build({
                metrics: {
                    getLifetimeTotals: jest
                        .fn()
                        .mockResolvedValue({ seeTimes: 100, sellTimes: 30, addCartTimes: 90 }),
                },
            });

            const report = await service.getConversion(RANGE);

            expect(report.lifetime.addToCartToSaleRate).toBe(33.33);

            const { service: empty } = build();
            const noEvents = await empty.getConversion(RANGE);
            expect(noEvents.lifetime.addToCartToSaleRate).toBe(0);
        });

        it('turns the abandonment window into a cutoff in the past', async () => {
            const { service, cartRepository } = build();

            await service.getConversion({ ...RANGE, abandonedAfterHours: 48 });

            const cutoff = cartRepository.getCartSnapshot.mock.calls[0][0] as Date;
            const hoursAgo = (Date.now() - cutoff.getTime()) / 3_600_000;
            expect(hoursAgo).toBeCloseTo(48, 1);
        });
    });
});
