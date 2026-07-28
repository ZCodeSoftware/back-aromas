import { ILifetimeCounters, IProductMetrics, ITopProduct } from "../types/analytics.type";

export interface IMetricsRepository {
    /** All increments upsert, so the counter document appears on the first event. */
    incrementSeeTimes(productId: string): Promise<void>;
    incrementAddCartTimes(productId: string): Promise<void>;
    incrementSellTimes(productId: string, quantity: number): Promise<void>;
    findByProduct(productId: string): Promise<IProductMetrics>;
    topBy(field: 'seeTimes' | 'addCartTimes' | 'sellTimes', limit: number): Promise<ITopProduct[]>;
    /**
     * Sum of every counter across the catalogue. Lifetime by nature: the documents
     * hold no per-event timestamp, so these can never honour a date range.
     */
    getLifetimeTotals(): Promise<ILifetimeCounters>;
}
