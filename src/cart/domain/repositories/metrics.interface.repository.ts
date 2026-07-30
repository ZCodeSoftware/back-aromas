/**
 * Narrow outbound port to the analytics counters. Bound to
 * `SymbolsAnalytics.IMetricsRepository` inside CartModule only.
 */
export interface IMetricsRepository {
    incrementAddCartTimes(productId: string): Promise<void>;
}
