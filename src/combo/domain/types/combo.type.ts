import { ComboPriceMode } from "../enum/combo-price-mode.enum";

/** One component as it arrives from the API: a product id and how many units. */
export interface IComboItem {
    productId: string;
    quantity: number;
}

export interface ICreateCombo {
    name: string;
    description?: string;
    images?: string[];
    items: IComboItem[];
    priceMode: ComboPriceMode;
    fixedPrice?: number;
    discountPercentage?: number;
    isActive?: boolean;
}

/** Slice of a product a combo needs to derive its price and its stock. */
export interface IComboProduct {
    _id: string;
    name: string;
    price: number;
    stock: number;
    isActive: boolean;
    images?: string[];
}

/** A component resolved against the live catalogue. */
export interface IResolvedComboItem {
    product: IComboProduct;
    quantity: number;
}

export interface IComboFilterOptions {
    page?: number;
    limit?: number;
    search?: string;
    isActive?: boolean;
    /** Admin listing: bring the soft-deleted combos back too. */
    includeInactive?: boolean;
    /** True keeps only the combos that can actually be sold right now. */
    hasStock?: boolean;
}
