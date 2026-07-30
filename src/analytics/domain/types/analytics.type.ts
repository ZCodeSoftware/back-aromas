import { GroupBy } from "../enum/group-by.enum";

export interface IProductRef {
    _id: string;
    name?: string;
}

export interface IProductMetrics {
    product: IProductRef;
    seeTimes: number;
    sellTimes: number;
    addCartTimes: number;
}

export interface ITopProduct {
    product: IProductRef;
    value: number;
}

export interface ITopSoldProduct {
    product: IProductRef;
    name: string;
    quantity: number;
    revenue: number;
}

export interface IOrdersByStatus {
    status: string;
    count: number;
}

/**
 * `revenue` keeps its original meaning — every order that was not cancelled or
 * refunded, PENDING included — so the number the dashboard has always shown does
 * not silently change. `paidRevenue` is the one to trust for money actually
 * taken, and the one to use when reconciling the till.
 */
export interface ISalesSummary {
    totalOrders: number;
    revenue: number;
    paidOrders: number;
    paidRevenue: number;
    subTotal: number;
    shipping: number;
    ordersByStatus: IOrdersByStatus[];
    topSold: ITopSoldProduct[];
}

/** How a block of numbers relates to the requested date range. */
export type MetricScope = 'RANGE' | 'SNAPSHOT' | 'LIFETIME';

export interface IRangeEcho {
    dateFrom: string;
    dateTo: string;
    timezone: string;
}

export interface IDashboard {
    /** Null means all time, which is what omitting both dates gives you. */
    range: IRangeEcho | null;
    catalogue: {
        totalProducts: number;
        totalUsers: number;
    };
    sales: ISalesSummary;
    engagement: {
        /** Always LIFETIME: the counters carry no per-event timestamp. */
        scope: MetricScope;
        topViewed: ITopProduct[];
        topAddedToCart: ITopProduct[];
    };
}

/* ---------------------------------------------------------------- inputs */

export interface IAnalyticsRangeInput {
    dateFrom?: string;
    dateTo?: string;
    timezone?: string;
}

export interface ISalesTimeSeriesInput extends IAnalyticsRangeInput {
    groupBy?: GroupBy;
}

export interface IInventoryInput extends IAnalyticsRangeInput {
    lowStockThreshold?: number;
    limit?: number;
}

export interface ICustomersInput extends IAnalyticsRangeInput {
    limit?: number;
}

export interface IConversionInput extends IAnalyticsRangeInput {
    abandonedAfterHours?: number;
}

/* ------------------------------------------------------------ time series */

/** One calendar day as it comes out of the aggregation. */
export interface ISalesDailyRow {
    day: string;
    orders: number;
    revenue: number;
    subTotal: number;
    shipping: number;
    paidOrders: number;
    paidRevenue: number;
}

export interface ISalesPoint {
    /** Day, ISO-week Monday or month, depending on groupBy. */
    bucket: string;
    /** True when the bucket extends outside the requested range. */
    partial: boolean;
    orders: number;
    revenue: number;
    subTotal: number;
    shipping: number;
    paidOrders: number;
    paidRevenue: number;
    avgTicket: number;
    paidAvgTicket: number;
}

export interface ISalesTotals {
    orders: number;
    revenue: number;
    subTotal: number;
    shipping: number;
    paidOrders: number;
    paidRevenue: number;
    avgTicket: number;
    paidAvgTicket: number;
}

export interface ISalesTimeSeries {
    range: IRangeEcho;
    groupBy: GroupBy;
    totals: ISalesTotals;
    points: ISalesPoint[];
}

/* -------------------------------------------------------------- breakdown */

/** One { channel, paymentMethod } cell straight out of the aggregation. */
export interface IBreakdownRow {
    channel: string;
    paymentMethodId: string | null;
    orders: number;
    revenue: number;
    paidOrders: number;
    paidRevenue: number;
}

export interface IChannelBucket {
    channel: string;
    orders: number;
    revenue: number;
    paidOrders: number;
    paidRevenue: number;
    share: number;
}

export interface IPaymentMethodBucket {
    paymentMethodId: string | null;
    name: string;
    orders: number;
    revenue: number;
    paidOrders: number;
    paidRevenue: number;
    share: number;
}

export interface IBreakdownCell {
    channel: string;
    paymentMethodId: string | null;
    name: string;
    orders: number;
    revenue: number;
    paidOrders: number;
    paidRevenue: number;
}

export interface ISalesBreakdown {
    range: IRangeEcho;
    totals: Omit<ISalesTotals, 'subTotal' | 'shipping' | 'avgTicket' | 'paidAvgTicket'>;
    byChannel: IChannelBucket[];
    byPaymentMethod: IPaymentMethodBucket[];
    matrix: IBreakdownCell[];
}

/* -------------------------------------------------------------- inventory */

export interface IStockSummary {
    activeProducts: number;
    unitsInStock: number;
    /** At sale price: there is no cost field on a product. */
    inventoryValueAtSalePrice: number;
    outOfStockCount: number;
    lowStockCount: number;
}

export interface IStockProduct {
    _id: string;
    name: string;
    price: number;
    stock: number;
    images?: string[];
}

export interface IDeadStock {
    definition: string;
    range: IRangeEcho;
    count: number;
    valueAtSalePrice: number;
    items: IStockProduct[];
}

export interface IInventoryReport {
    generatedAt: Date;
    /** Snapshot blocks below ignore the range; only deadStock uses it. */
    scope: MetricScope;
    summary: IStockSummary & { lowStockThreshold: number };
    lowStock: IStockProduct[];
    outOfStock: IStockProduct[];
    deadStock: IDeadStock;
}

/* -------------------------------------------------------------- customers */

export interface ITopCustomer {
    userId: string;
    firstName?: string;
    lastName?: string;
    email?: string;
    orders: number;
    revenue: number;
    lastOrderAt: Date;
}

export interface ICustomerCohorts {
    newCustomers: number;
    returningCustomers: number;
    ordersFromNew: number;
    ordersFromReturning: number;
    revenueFromNew: number;
    revenueFromReturning: number;
}

export interface IAnonymousSales {
    orders: number;
    revenue: number;
}

export interface ICustomersReport {
    range: IRangeEcho;
    topCustomers: ITopCustomer[];
    cohorts: ICustomerCohorts & { definition: string };
    anonymous: IAnonymousSales & { note: string };
}

/* ------------------------------------------------------------- conversion */

export interface ICartSnapshot {
    cartsWithItems: number;
    abandonedCarts: number;
    abandonedValueAtCartPrices: number;
}

export interface ILifetimeCounters {
    seeTimes: number;
    sellTimes: number;
    addCartTimes: number;
}

export interface IConversionReport {
    snapshotAt: Date;
    range: IRangeEcho;
    carts: ICartSnapshot & { scope: MetricScope; abandonedAfterHours: number; note: string };
    orders: {
        scope: MetricScope;
        ordersInRange: number;
        customerOrdersInRange: number;
        anonymousOrdersInRange: number;
    };
    lifetime: {
        scope: MetricScope;
        addToCartEvents: number;
        soldUnits: number;
        addToCartToSaleRate: number;
        note: string;
    };
}
