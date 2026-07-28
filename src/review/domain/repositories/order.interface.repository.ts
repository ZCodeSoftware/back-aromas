/**
 * Narrow outbound port to the order aggregate: reviews are restricted to
 * verified buyers. Bound to `SymbolsOrder.IOrderRepository` inside
 * ReviewModule only.
 */
export interface IOrderRepository {
    hasPurchasedProduct(userId: string, productId: string): Promise<boolean>;
}
