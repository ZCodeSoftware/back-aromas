import { OrderStatus } from "../enum/order-status.enum";
import { ShippingType } from "../enum/shipping-type.enum";

export interface ICreateOrder {
    paymentMethod: string;
    shippingType: ShippingType;
    addressId?: string;
    shippingPrice?: number;
}

export interface IOrderFilterOptions {
    page?: number;
    limit?: number;
    status?: OrderStatus;
    userId?: string;
    dateFrom?: Date;
    dateTo?: Date;
}

/** Slice of a product the order flow needs; see IProductRepository. */
export interface IOrderProduct {
    _id: string;
    name: string;
    price: number;
    stock: number;
    isActive: boolean;
}

/** Slice of a cart the order flow needs; see ICartRepository. */
export interface IOrderCartItem {
    productId: string;
    quantity: number;
}

export interface IOrderCart {
    _id: string;
    items: IOrderCartItem[];
}

export interface IOrderAddress {
    _id: string;
    name?: string;
    street: string;
    number?: number;
    zipCode: string;
    description?: string;
    floorAddress?: string;
}
