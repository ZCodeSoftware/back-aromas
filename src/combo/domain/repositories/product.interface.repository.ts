import { IComboProduct } from "../types/combo.type";

/**
 * The slice of the product catalogue a combo needs, declared here so the module
 * owns its own port instead of importing the one ProductModule wrote.
 */
export interface IProductRepository {
    findById(id: string): Promise<IComboProduct | null>;
}
