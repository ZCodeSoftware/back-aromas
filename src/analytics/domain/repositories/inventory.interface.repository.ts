import { IStockProduct, IStockSummary } from "../types/analytics.type";

/**
 * Inventory reads over the product collection. Owned by analytics — deliberately
 * separate from ICatalogueRepository, which is only head counts.
 */
export interface IInventoryRepository {
    getStockSummary(lowStockThreshold: number): Promise<IStockSummary>;
    findLowStock(lowStockThreshold: number, limit: number): Promise<IStockProduct[]>;
    findOutOfStock(limit: number): Promise<IStockProduct[]>;
    /** Active products holding stock that are absent from `soldProductIds`. */
    findDeadStock(soldProductIds: string[], limit: number): Promise<IStockProduct[]>;
    /** Count and value over the whole dead set, so `limit` does not distort them. */
    getDeadStockTotals(soldProductIds: string[]): Promise<{ count: number; valueAtSalePrice: number }>;
}
