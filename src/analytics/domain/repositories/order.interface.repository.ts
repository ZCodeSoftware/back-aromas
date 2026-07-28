import { ISalesSummary } from "../types/analytics.type";

/**
 * Narrow outbound port to the order aggregate. Sales figures are read straight
 * from the orders rather than from counters, so they are always exact.
 * Bound to `SymbolsOrder.IOrderRepository` inside AnalyticsModule only.
 */
export interface IOrderRepository {
    getSalesSummary(topLimit: number): Promise<ISalesSummary>;
}
