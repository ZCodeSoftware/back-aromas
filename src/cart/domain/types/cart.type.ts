/**
 * A line as it arrives from the API. Exactly one of `productId` / `comboId` is
 * set; the DTO enforces the pairing.
 */
export interface IAddCartItem {
    productId?: string;
    comboId?: string;
    quantity: number;
}

/** Slice of a product the cart actually needs; see IProductRepository. */
export interface ICartProduct {
    _id: string;
    name: string;
    price: number;
    stock: number;
    isActive: boolean;
}

/**
 * Slice of a combo the cart needs. `price` and `stock` are derived from the
 * components by the combo module, so the cart never recomputes them.
 */
export interface ICartCombo {
    _id: string;
    name: string;
    price: number;
    stock: number;
    isActive: boolean;
    hasAllComponentsAvailable: boolean;
}
