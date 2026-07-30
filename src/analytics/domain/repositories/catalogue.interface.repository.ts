/**
 * Narrow outbound port for the headline counts on the dashboard.
 * Bound to `SymbolsProduct.IProductRepository` inside AnalyticsModule only.
 */
export interface ICatalogueRepository {
    countProducts(): Promise<number>;
    countUsers(): Promise<number>;
}
