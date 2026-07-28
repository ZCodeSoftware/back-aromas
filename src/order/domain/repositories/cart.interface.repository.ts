import { IOrderCart } from "../types/order.type";

/**
 * Narrow outbound port to the cart aggregate. Bound to
 * `SymbolsCart.ICartRepository` inside OrderModule only.
 */
export interface ICartRepository {
    findByUser(userId: string): Promise<IOrderCart | null>;
    clear(cartId: string): Promise<void>;
}
