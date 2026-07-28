/**
 * Narrow outbound port to the analytics counters. Bound to
 * `SymbolsAnalytics.IMetricsRepository` inside OrderModule only.
 */
export interface IMetricsRepository {
    incrementSellTimes(productId: string, quantity: number): Promise<void>;
}
