import { ICartProduct } from "../types/cart.type";

/**
 * Narrow outbound port to the product aggregate. The cart only needs price,
 * stock and availability, so it reads a projection instead of duplicating the
 * whole ProductModel. Bound to `SymbolsProduct.IProductRepository` inside
 * CartModule only.
 */
export interface IProductRepository {
    findById(id: string): Promise<ICartProduct | null>;
}
