/**
 * Narrow outbound port to the analytics counters. Bound to
 * `SymbolsAnalytics.IMetricsRepository` inside ProductModule only.
 */
export interface IMetricsRepository {
    incrementSeeTimes(productId: string): Promise<void>;
}
