import { CartModel } from "../models/cart.model";

export interface ICartRepository {
    create(cart: CartModel): Promise<CartModel>;
    /** Returns null when the user has no cart yet. */
    findByUser(userId: string): Promise<CartModel | null>;
    update(cart: CartModel): Promise<CartModel>;
}
