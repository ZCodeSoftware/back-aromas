import { IDashboard, IProductMetrics } from "../types/analytics.type";

export interface IAnalyticsService {
    getDashboard(): Promise<IDashboard>;
    getProductMetrics(productId: string): Promise<IProductMetrics>;
}
