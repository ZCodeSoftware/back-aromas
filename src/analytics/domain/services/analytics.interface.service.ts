import {
    IAnalyticsRangeInput,
    IConversionInput,
    IConversionReport,
    ICustomersInput,
    ICustomersReport,
    IDashboard,
    IInventoryInput,
    IInventoryReport,
    IProductMetrics,
    ISalesBreakdown,
    ISalesTimeSeries,
    ISalesTimeSeriesInput,
} from "../types/analytics.type";

export interface IAnalyticsService {
    /** All-time when the caller sends no dates, which keeps the original contract. */
    getDashboard(query: IAnalyticsRangeInput): Promise<IDashboard>;
    getProductMetrics(productId: string): Promise<IProductMetrics>;
    getSalesTimeSeries(query: ISalesTimeSeriesInput): Promise<ISalesTimeSeries>;
    getSalesBreakdown(query: IAnalyticsRangeInput): Promise<ISalesBreakdown>;
    getInventory(query: IInventoryInput): Promise<IInventoryReport>;
    getCustomers(query: ICustomersInput): Promise<ICustomersReport>;
    getConversion(query: IConversionInput): Promise<IConversionReport>;
}
