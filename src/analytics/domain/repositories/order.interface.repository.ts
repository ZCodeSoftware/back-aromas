import {
    IAnonymousSales,
    IBreakdownRow,
    ICustomerCohorts,
    ISalesDailyRow,
    ISalesSummary,
    ITopCustomer,
} from "../types/analytics.type";
import { IResolvedRange } from "../utils/date-range.util";

/**
 * Narrow outbound port to the order aggregate. Sales figures are read straight
 * from the orders rather than from counters, so they are always exact.
 * Bound to `SymbolsOrder.IOrderRepository` inside AnalyticsModule only.
 */
export interface IOrderRepository {
    /** A null range means all time, which is what the dashboard defaults to. */
    getSalesSummary(topLimit: number, range?: IResolvedRange | null): Promise<ISalesSummary>;
    /** One row per calendar day of the range, cut in the range's timezone. */
    getSalesDaily(range: IResolvedRange): Promise<ISalesDailyRow[]>;
    /** One row per { channel, paymentMethod } pair. */
    getSalesBreakdown(range: IResolvedRange): Promise<IBreakdownRow[]>;
    getTopCustomers(range: IResolvedRange, limit: number): Promise<ITopCustomer[]>;
    /** Scans the whole collection: a first-ever order date cannot be range-bounded. */
    getCustomerCohorts(range: IResolvedRange): Promise<ICustomerCohorts>;
    /** Counter sales with no linked account. */
    getAnonymousSales(range: IResolvedRange): Promise<IAnonymousSales>;
    /** Distinct products that moved inside the range; backs the dead-stock anti-join. */
    getSoldProductIds(range: IResolvedRange): Promise<string[]>;
    countOrders(range: IResolvedRange): Promise<number>;
}
