import { ICartCombo } from "../types/cart.type";

/**
 * The slice of the combo catalogue the cart needs. Its own port, so the cart
 * module does not depend on the combo module's repository interface.
 */
export interface IComboRepository {
    findById(id: string): Promise<ICartCombo | null>;
}
