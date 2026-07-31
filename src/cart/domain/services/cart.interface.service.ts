import { CartModel } from "../models/cart.model";
import { IAddCartItem } from "../types/cart.type";

export interface ICartService {
    /** Returns the user's cart, creating an empty one on first access. */
    getByUser(userId: string): Promise<CartModel>;
    /** Takes a product or a combo, never both; the DTO enforces it. */
    addItem(userId: string, item: IAddCartItem): Promise<CartModel>;
    updateItemQuantity(userId: string, productId: string, quantity: number): Promise<CartModel>;
    updateComboQuantity(userId: string, comboId: string, quantity: number): Promise<CartModel>;
    removeItem(userId: string, productId: string): Promise<CartModel>;
    removeCombo(userId: string, comboId: string): Promise<CartModel>;
    clear(userId: string): Promise<CartModel>;
    /** Stores the code so it survives a reload; validation happens at pricing time. */
    setCoupon(userId: string, code?: string): Promise<CartModel>;
}
