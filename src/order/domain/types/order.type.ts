import { OrderChannel } from "../enum/order-channel.enum";
import { OrderStatus } from "../enum/order-status.enum";
import { ShippingType } from "../enum/shipping-type.enum";

/**
 * A row of the status catalogue as the order flow uses it: the id is what the
 * document stores, the code is what the state machine reasons about.
 */
export interface IOrderStatusRef {
    _id: string;
    code: OrderStatus;
    name: string;
}

export interface ICreateOrder {
    paymentMethod: string;
    shippingType: ShippingType;
    addressId?: string;
    shippingPrice?: number;
}

export interface IOrderFilterOptions {
    page?: number;
    limit?: number;
    /** Status code as it arrives from the API; services translate it to `statusId`. */
    status?: OrderStatus;
    /** Catalogue id the documents are actually matched against. */
    statusId?: string;
    userId?: string;
    dateFrom?: Date;
    dateTo?: Date;
    channel?: OrderChannel;
    soldBy?: string;
}

/** One line of a counter sale, as it arrives from the till. */
export interface IPosSaleItem {
    productId: string;
    quantity: number;
}

/** Loose buyer data for a walk-in customer with no account. */
export interface IPosSaleCustomer {
    name?: string;
    email?: string;
    phone?: string;
    taxId?: string;
}

export interface ICreatePosSale {
    items: IPosSaleItem[];
    paymentMethod: string;
    /** Links the sale to an existing account. Mutually exclusive with `customer`. */
    userId?: string;
    customer?: IPosSaleCustomer;
}

/** A line whose stock has been taken and may have to be given back. */
export interface IStockReservation {
    productId: string;
    quantity: number;
}

/** A validated sale line: a live product plus the amount being sold. */
export interface IOrderLine {
    product: IOrderProduct;
    quantity: number;
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
