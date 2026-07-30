import { IOrderProduct } from "../types/order.type";

/**
 * Narrow outbound port to the product aggregate. Bound to
 * `SymbolsProduct.IProductRepository` inside OrderModule only.
 */
export interface IProductRepository {
    findById(id: string): Promise<IOrderProduct | null>;
    /**
     * Atomically takes `quantity` units off the product, but only if there are
     * enough left. Returns false when the guard did not match, so the caller can
     * roll back what it already reserved.
     */
    decrementStock(productId: string, quantity: number): Promise<boolean>;
    incrementStock(productId: string, quantity: number): Promise<void>;
}
