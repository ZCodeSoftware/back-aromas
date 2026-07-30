export interface IAddCartItem {
    productId: string;
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
