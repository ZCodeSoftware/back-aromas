import { CartModel } from "../models/cart.model";
import { IAddCartItem } from "../types/cart.type";

export interface ICartService {
    /** Returns the user's cart, creating an empty one on first access. */
    getByUser(userId: string): Promise<CartModel>;
    addItem(userId: string, item: IAddCartItem): Promise<CartModel>;
    updateItemQuantity(userId: string, productId: string, quantity: number): Promise<CartModel>;
    removeItem(userId: string, productId: string): Promise<CartModel>;
    clear(userId: string): Promise<CartModel>;
}
