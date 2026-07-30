import { IProductRatingStats } from "../types/review.type";

/**
 * Narrow outbound port to the product aggregate. Bound to
 * `SymbolsProduct.IProductRepository` inside ReviewModule only.
 */
export interface IProductRepository {
    exists(id: string): Promise<boolean>;
    updateRatingStats(productId: string, stats: IProductRatingStats): Promise<void>;
}
