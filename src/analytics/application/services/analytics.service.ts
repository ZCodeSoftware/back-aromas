import { Inject, Injectable } from "@nestjs/common";
import config from "../../../config";
import { round2 } from "../../../core/domain/utils/money.util";
import { OrderChannel } from "../../../order/domain/enum/order-channel.enum";
import SymbolsOrder from "../../../order/symbols-order";
import { GroupBy } from "../../domain/enum/group-by.enum";
import { IAnalyticsCartRepository } from "../../domain/repositories/cart.interface.repository";
import { ICatalogueRepository } from "../../domain/repositories/catalogue.interface.repository";
import { IInventoryRepository } from "../../domain/repositories/inventory.interface.repository";
import { IMetricsRepository } from "../../domain/repositories/metrics.interface.repository";
import { IOrderRepository } from "../../domain/repositories/order.interface.repository";
import { IAnalyticsService } from "../../domain/services/analytics.interface.service";
import {
    IAnalyticsRangeInput,
    IBreakdownCell,
    IBreakdownRow,
    IChannelBucket,
    IConversionInput,
    IConversionReport,
    ICustomersInput,
    ICustomersReport,
    IDashboard,
    IInventoryInput,
    IInventoryReport,
    IPaymentMethodBucket,
    IProductMetrics,
    IRangeEcho,
    ISalesBreakdown,
    ISalesTimeSeries,
    ISalesTimeSeriesInput,
} from "../../domain/types/analytics.type";
import {
    DEFAULT_TZ_OFFSET,
    IResolvedRange,
    resolveOptionalRange,
    resolveRange,
} from "../../domain/utils/date-range.util";
import { rollUp } from "../../domain/utils/time-series.util";
import SymbolsAnalytics from "../../symbols-analytics";
import { ICatPaymentMethodRepository } from "../../domain/repositories/cat-payment-method.interface.repository";
import SymbolsCatalogs from "../../../catalogs/symbols-catalogs";

const TOP_LIMIT = 5;
const DEFAULT_LOW_STOCK_THRESHOLD = 5;
const DEFAULT_LIST_LIMIT = 20;
const DEFAULT_CUSTOMERS_LIMIT = 10;
const DEFAULT_ABANDONED_AFTER_HOURS = 24;
const MS_PER_HOUR = 3_600_000;

const UNKNOWN_PAYMENT_METHOD = 'UNKNOWN';

const CART_NOTE =
    'Point in time. There is one cart per registered user, emptied on checkout, so this cannot be scoped to a date range. Guests have no cart and are invisible here.';
const LIFETIME_NOTE =
    'Derived from lifetime counters that carry no per-event timestamp, so dateFrom and dateTo do not affect them. The counters are never decremented on cancellation or refund, so soldUnits is an upper bound.';
const ANONYMOUS_NOTE =
    'Counter sales with no linked account. Excluded from topCustomers and from the cohorts.';
const COHORT_DEFINITION =
    "New means the customer's first-ever revenue order falls inside this range.";
const DEAD_STOCK_DEFINITION =
    'Active products holding stock that sold no unit inside the selected range.';

@Injectable()
export class AnalyticsService implements IAnalyticsService {
    constructor(
        @Inject(SymbolsAnalytics.IMetricsRepository)
        private readonly metricsRepository: IMetricsRepository,
        @Inject(SymbolsOrder.IOrderRepository)
        private readonly orderRepository: IOrderRepository,
        @Inject(SymbolsAnalytics.ICatalogueRepository)
        private readonly catalogueRepository: ICatalogueRepository,
        @Inject(SymbolsAnalytics.IInventoryRepository)
        private readonly inventoryRepository: IInventoryRepository,
        @Inject(SymbolsAnalytics.ICartRepository)
        private readonly cartRepository: IAnalyticsCartRepository,
        @Inject(SymbolsCatalogs.ICatPaymentMethodRepository)
        private readonly catPaymentMethodRepository: ICatPaymentMethodRepository,
    ) { }

    async getDashboard(query: IAnalyticsRangeInput): Promise<IDashboard> {
        // Null range on purpose when no dates are sent: the dashboard has always
        // reported all time and that contract is kept.
        const range = resolveOptionalRange(query, this.defaultTimezone());

        const [totalProducts, totalUsers, sales, topViewed, topAddedToCart] = await Promise.all([
            this.catalogueRepository.countProducts(),
            this.catalogueRepository.countUsers(),
            this.orderRepository.getSalesSummary(TOP_LIMIT, range),
            this.metricsRepository.topBy('seeTimes', TOP_LIMIT),
            this.metricsRepository.topBy('addCartTimes', TOP_LIMIT),
        ]);

        return {
            range: range ? this.echo(range) : null,
            catalogue: { totalProducts, totalUsers },
            sales,
            engagement: { scope: 'LIFETIME', topViewed, topAddedToCart },
        };
    }

    async getProductMetrics(productId: string): Promise<IProductMetrics> {
        return this.metricsRepository.findByProduct(productId);
    }

    async getSalesTimeSeries(query: ISalesTimeSeriesInput): Promise<ISalesTimeSeries> {
        const range = resolveRange(query, this.defaultTimezone());
        const groupBy = query.groupBy ?? GroupBy.DAY;

        const rows = await this.orderRepository.getSalesDaily(range);
        const { totals, points } = rollUp(rows, range, groupBy);

        return { range: this.echo(range), groupBy, totals, points };
    }

    async getSalesBreakdown(query: IAnalyticsRangeInput): Promise<ISalesBreakdown> {
        const range = resolveRange(query, this.defaultTimezone());

        // The catalogue holds a handful of rows, so reading them all and joining in
        // memory beats a $lookup that would hardcode the collection name.
        const [rows, paymentMethods] = await Promise.all([
            this.orderRepository.getSalesBreakdown(range),
            this.catPaymentMethodRepository.findAllNames(),
        ]);

        const names = new Map<string, string>(
            paymentMethods.map((method) => [method._id, method.name]),
        );

        const totals = rows.reduce(
            (acc, row) => ({
                orders: acc.orders + row.orders,
                revenue: acc.revenue + row.revenue,
                paidOrders: acc.paidOrders + row.paidOrders,
                paidRevenue: acc.paidRevenue + row.paidRevenue,
            }),
            { orders: 0, revenue: 0, paidOrders: 0, paidRevenue: 0 },
        );

        return {
            range: this.echo(range),
            totals: {
                orders: totals.orders,
                revenue: round2(totals.revenue),
                paidOrders: totals.paidOrders,
                paidRevenue: round2(totals.paidRevenue),
            },
            byChannel: this.byChannel(rows, totals.revenue),
            byPaymentMethod: this.byPaymentMethod(rows, names, totals.revenue),
            matrix: this.matrix(rows, names),
        };
    }

    async getInventory(query: IInventoryInput): Promise<IInventoryReport> {
        const range = resolveRange(query, this.defaultTimezone());
        const threshold = query.lowStockThreshold ?? DEFAULT_LOW_STOCK_THRESHOLD;
        const limit = query.limit ?? DEFAULT_LIST_LIMIT;

        const [summary, lowStock, outOfStock, soldProductIds] = await Promise.all([
            this.inventoryRepository.getStockSummary(threshold),
            this.inventoryRepository.findLowStock(threshold, limit),
            this.inventoryRepository.findOutOfStock(limit),
            this.orderRepository.getSoldProductIds(range),
        ]);

        const [deadStockItems, deadStockTotals] = await Promise.all([
            this.inventoryRepository.findDeadStock(soldProductIds, limit),
            this.inventoryRepository.getDeadStockTotals(soldProductIds),
        ]);

        return {
            generatedAt: new Date(),
            // Everything but deadStock is a snapshot; deadStock carries its own range.
            scope: 'SNAPSHOT',
            summary: { ...summary, lowStockThreshold: threshold },
            lowStock,
            outOfStock,
            deadStock: {
                definition: DEAD_STOCK_DEFINITION,
                range: this.echo(range),
                count: deadStockTotals.count,
                valueAtSalePrice: deadStockTotals.valueAtSalePrice,
                items: deadStockItems,
            },
        };
    }

    async getCustomers(query: ICustomersInput): Promise<ICustomersReport> {
        const range = resolveRange(query, this.defaultTimezone());
        const limit = query.limit ?? DEFAULT_CUSTOMERS_LIMIT;

        const [topCustomers, cohorts, anonymous] = await Promise.all([
            this.orderRepository.getTopCustomers(range, limit),
            this.orderRepository.getCustomerCohorts(range),
            this.orderRepository.getAnonymousSales(range),
        ]);

        return {
            range: this.echo(range),
            topCustomers,
            cohorts: { ...cohorts, definition: COHORT_DEFINITION },
            anonymous: { ...anonymous, note: ANONYMOUS_NOTE },
        };
    }

    async getConversion(query: IConversionInput): Promise<IConversionReport> {
        const range = resolveRange(query, this.defaultTimezone());
        const abandonedAfterHours = query.abandonedAfterHours ?? DEFAULT_ABANDONED_AFTER_HOURS;
        const cutoff = new Date(Date.now() - abandonedAfterHours * MS_PER_HOUR);

        const [carts, ordersInRange, anonymous, lifetime] = await Promise.all([
            this.cartRepository.getCartSnapshot(cutoff),
            this.orderRepository.countOrders(range),
            this.orderRepository.getAnonymousSales(range),
            this.metricsRepository.getLifetimeTotals(),
        ]);

        return {
            snapshotAt: new Date(),
            range: this.echo(range),
            carts: { ...carts, scope: 'SNAPSHOT', abandonedAfterHours, note: CART_NOTE },
            orders: {
                scope: 'RANGE',
                ordersInRange,
                customerOrdersInRange: ordersInRange - anonymous.orders,
                anonymousOrdersInRange: anonymous.orders,
            },
            lifetime: {
                scope: 'LIFETIME',
                addToCartEvents: lifetime.addCartTimes,
                soldUnits: lifetime.sellTimes,
                addToCartToSaleRate: lifetime.addCartTimes
                    ? round2((lifetime.sellTimes / lifetime.addCartTimes) * 100)
                    : 0,
                note: LIFETIME_NOTE,
            },
        };
    }

    private byChannel(rows: IBreakdownRow[], totalRevenue: number): IChannelBucket[] {
        const buckets = new Map<string, IChannelBucket>();

        // Seeded so a channel with no sales still reports zeros rather than vanishing.
        Object.values(OrderChannel).forEach((channel) =>
            buckets.set(channel, {
                channel,
                orders: 0,
                revenue: 0,
                paidOrders: 0,
                paidRevenue: 0,
                share: 0,
            }),
        );

        rows.forEach((row) => {
            const bucket = buckets.get(row.channel) ?? {
                channel: row.channel,
                orders: 0,
                revenue: 0,
                paidOrders: 0,
                paidRevenue: 0,
                share: 0,
            };

            bucket.orders += row.orders;
            bucket.revenue += row.revenue;
            bucket.paidOrders += row.paidOrders;
            bucket.paidRevenue += row.paidRevenue;
            buckets.set(row.channel, bucket);
        });

        return [...buckets.values()].map((bucket) => ({
            ...bucket,
            revenue: round2(bucket.revenue),
            paidRevenue: round2(bucket.paidRevenue),
            share: this.share(bucket.revenue, totalRevenue),
        }));
    }

    private byPaymentMethod(
        rows: IBreakdownRow[],
        names: Map<string, string>,
        totalRevenue: number,
    ): IPaymentMethodBucket[] {
        const buckets = new Map<string, IPaymentMethodBucket>();

        rows.forEach((row) => {
            const key = row.paymentMethodId ?? UNKNOWN_PAYMENT_METHOD;
            const bucket = buckets.get(key) ?? {
                paymentMethodId: row.paymentMethodId,
                name: this.paymentMethodName(row.paymentMethodId, names),
                orders: 0,
                revenue: 0,
                paidOrders: 0,
                paidRevenue: 0,
                share: 0,
            };

            bucket.orders += row.orders;
            bucket.revenue += row.revenue;
            bucket.paidOrders += row.paidOrders;
            bucket.paidRevenue += row.paidRevenue;
            buckets.set(key, bucket);
        });

        return [...buckets.values()]
            .map((bucket) => ({
                ...bucket,
                revenue: round2(bucket.revenue),
                paidRevenue: round2(bucket.paidRevenue),
                share: this.share(bucket.revenue, totalRevenue),
            }))
            .sort((a, b) => b.revenue - a.revenue);
    }

    private matrix(rows: IBreakdownRow[], names: Map<string, string>): IBreakdownCell[] {
        return rows.map((row) => ({
            channel: row.channel,
            paymentMethodId: row.paymentMethodId,
            name: this.paymentMethodName(row.paymentMethodId, names),
            orders: row.orders,
            revenue: row.revenue,
            paidOrders: row.paidOrders,
            paidRevenue: row.paidRevenue,
        }));
    }

    /**
     * A deleted catalogue row must never make the bucket disappear, or the shares
     * stop summing to 100.
     */
    private paymentMethodName(id: string | null, names: Map<string, string>): string {
        if (!id) return UNKNOWN_PAYMENT_METHOD;

        return names.get(id) ?? UNKNOWN_PAYMENT_METHOD;
    }

    private share(value: number, total: number): number {
        return total ? round2((value / total) * 100) : 0;
    }

    private echo(range: IResolvedRange): IRangeEcho {
        return { dateFrom: range.dateFrom, dateTo: range.dateTo, timezone: range.timezone };
    }

    private defaultTimezone(): string {
        return config().app.analytics?.tz_offset || DEFAULT_TZ_OFFSET;
    }
}
