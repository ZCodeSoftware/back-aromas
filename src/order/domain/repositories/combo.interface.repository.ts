import { IOrderCombo } from "../types/order.type";

/**
 * Narrow outbound port to the combo aggregate. Bound to
 * `SymbolsCombo.IComboRepository` inside OrderModule only.
 */
export interface IComboRepository {
    /** Returns the combo already priced against the live catalogue, or null. */
    findById(id: string): Promise<IOrderCombo | null>;
}
