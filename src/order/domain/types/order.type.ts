import { OrderChannel } from "../enum/order-channel.enum";
import { OrderItemType } from "../enum/order-item-type.enum";
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
    /** Wins over whatever is parked on the cart. */
    couponCode?: string;
}

/** What the checkout needs priced before the buyer commits. */
export interface IPreviewOrder {
    couponCode?: string;
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

/**
 * One line of a counter sale, as it arrives from the till. Exactly one of
 * `productId` / `comboId` is set; the DTO enforces it.
 */
export interface IPosSaleItem {
    productId?: string;
    comboId?: string;
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
    couponCode?: string;
}

/** What the counter needs priced before taking the money. */
export interface IPreviewPosSale {
    items: IPosSaleItem[];
    userId?: string;
    couponCode?: string;
}

/** A line whose stock has been taken and may have to be given back. */
export interface IStockReservation {
    productId: string;
    quantity: number;
}

/**
 * Product units moved by a sale line, once combos have been flattened into the
 * components behind them. This is the only shape stock reservation understands.
 */
export interface IStockLine {
    productId: string;
    quantity: number;
    /** Only for the error message; absent when flattened from a stored order. */
    name?: string;
}

/** A validated sale line: a live product plus the amount being sold. */
export interface IOrderLine {
    product: IOrderProduct;
    quantity: number;
}

/** A validated combo line: the combo priced against the live catalogue. */
export interface IOrderComboLine {
    combo: IOrderCombo;
    quantity: number;
}

/**
 * A validated sale line of either kind. `itemType` is the discriminator the
 * order and point-of-sale services switch on when they build the snapshot.
 */
export type ISaleLine =
    | ({ itemType: OrderItemType.PRODUCT } & IOrderLine)
    | ({ itemType: OrderItemType.COMBO } & IOrderComboLine);

/** Slice of a product the order flow needs; see IProductRepository. */
export interface IOrderProduct {
    _id: string;
    name: string;
    price: number;
    stock: number;
    isActive: boolean;
    /** Present when the repository selects it; the pricing engine scopes on it. */
    category?: string;
    subCategory?: string;
}

/** One component of a combo, snapshotted onto the order line. */
export interface IOrderItemComponent {
    product: any;
    name: string;
    /** Units per single combo, not per order line. */
    quantity: number;
    unitPrice: number;
}

/** Slice of a combo the order flow needs, already priced; see IComboRepository. */
export interface IOrderCombo {
    _id: string;
    name: string;
    price: number;
    stock: number;
    isActive: boolean;
    components: IOrderItemComponent[];
}

/**
 * Slice of a cart the order flow needs; see ICartRepository. Exactly one of
 * `productId` / `comboId` is set, mirroring the stored line.
 */
export interface IOrderCartItem {
    itemType: OrderItemType;
    productId?: string;
    comboId?: string;
    quantity: number;
}

export interface IOrderCart {
    _id: string;
    items: IOrderCartItem[];
    /** Parked by the buyer earlier; revalidated on every pricing run. */
    couponCode?: string;
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
