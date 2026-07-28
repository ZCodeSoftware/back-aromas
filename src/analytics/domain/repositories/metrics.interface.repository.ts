import { IProductMetrics, ITopProduct } from "../types/analytics.type";

export interface IMetricsRepository {
    /** All increments upsert, so the counter document appears on the first event. */
    incrementSeeTimes(productId: string): Promise<void>;
    incrementAddCartTimes(productId: string): Promise<void>;
    incrementSellTimes(productId: string, quantity: number): Promise<void>;
    findByProduct(productId: string): Promise<IProductMetrics>;
    topBy(field: 'seeTimes' | 'addCartTimes' | 'sellTimes', limit: number): Promise<ITopProduct[]>;
}
