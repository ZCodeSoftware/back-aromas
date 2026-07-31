import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose";
import mongoose, { HydratedDocument } from "mongoose";
import { CatOrderStatus } from "../catalogs/cat-order-status.schema";
import { CatPaymentMethod } from "../catalogs/cat-payment-method.schema";
import { Address } from "./address.schema";
import { Combo } from "./combo.schema";
import { Product } from "./product.schema";
import { Promotion } from "./promotion.schema";
import { User } from "./user.schema";

export type OrderDocument = HydratedDocument<Order>;

/**
 * One component of a purchased combo, snapshotted like the line above it.
 * `quantity` is per unit of combo, so the units actually sold are
 * `component.quantity * item.quantity` — that is what stock restoring uses.
 */
@Schema({ _id: false })
export class OrderItemComponent {
    @Prop({ required: true, name: 'product', type: mongoose.Schema.Types.ObjectId, ref: 'Product' })
    product: Product;

    @Prop({ required: true, name: 'name', type: String })
    name: string;

    @Prop({ required: true, name: 'quantity', type: Number, min: 1 })
    quantity: number;

    @Prop({ required: true, name: 'unitPrice', type: Number, min: 0 })
    unitPrice: number;
}

export const OrderItemComponentSchema = SchemaFactory.createForClass(OrderItemComponent);

/**
 * Which promotion took how much off. Snapshotted for the same reason as the
 * price: editing or deleting a promotion must not rewrite a past order. Reused
 * both per line and at order level.
 */
@Schema({ _id: false })
export class OrderAppliedPromotion {
    @Prop({ required: true, name: 'promotion', type: mongoose.Schema.Types.ObjectId, ref: 'Promotion' })
    promotion: Promotion;

    /** Absent on an automatic promotion, which needs no code to apply. */
    @Prop({ required: false, name: 'code', type: String })
    code: string;

    @Prop({ required: true, name: 'name', type: String })
    name: string;

    @Prop({ required: true, name: 'valueType', type: String })
    valueType: string;

    @Prop({ required: true, name: 'value', type: Number })
    value: number;

    @Prop({ required: true, name: 'scope', type: String })
    scope: string;

    @Prop({ required: true, name: 'discount', type: Number, min: 0 })
    discount: number;
}

export const OrderAppliedPromotionSchema = SchemaFactory.createForClass(OrderAppliedPromotion);

/**
 * Immutable snapshot of a purchased line. `name` and `unitPrice` are copied on
 * purpose: a later price change or a deleted product must not rewrite history.
 *
 * A line is either a product or a combo, told apart by `itemType`. Documents
 * written before combos existed carry neither `itemType` nor `combo`; reads
 * treat a missing type as PRODUCT.
 */
@Schema({ _id: false })
export class OrderItem {
    /** PRODUCT | COMBO. Plain string for the same reason as `Order.channel`. */
    @Prop({ required: true, name: 'itemType', type: String, default: 'PRODUCT' })
    itemType: string;

    /** Set on a PRODUCT line. Optional since a COMBO line points at `combo` instead. */
    @Prop({ required: false, name: 'product', type: mongoose.Schema.Types.ObjectId, ref: 'Product' })
    product: Product;

    /** Set on a COMBO line. */
    @Prop({ required: false, name: 'combo', type: mongoose.Schema.Types.ObjectId, ref: 'Combo' })
    combo: Combo;

    /** What the combo was made of at purchase time. Empty on a PRODUCT line. */
    @Prop({ required: false, name: 'components', type: [OrderItemComponentSchema], default: [] })
    components: OrderItemComponent[];

    @Prop({ required: true, name: 'name', type: String })
    name: string;

    @Prop({ required: true, name: 'unitPrice', type: Number, min: 0 })
    unitPrice: number;

    @Prop({ required: true, name: 'quantity', type: Number, min: 1 })
    quantity: number;

    /** Gross line amount: `unitPrice * quantity`, before any discount. */
    @Prop({ required: true, name: 'total', type: Number, min: 0 })
    total: number;

    @Prop({ required: false, name: 'discount', type: Number, min: 0, default: 0 })
    discount: number;

    /** `total - discount`. What the buyer actually paid for this line. */
    @Prop({ required: false, name: 'netTotal', type: Number, min: 0, default: 0 })
    netTotal: number;

    @Prop({ required: false, name: 'appliedPromotions', type: [OrderAppliedPromotionSchema], default: [] })
    appliedPromotions: OrderAppliedPromotion[];
}

export const OrderItemSchema = SchemaFactory.createForClass(OrderItem);

/** Snapshot of the address at purchase time, plus a reference for traceability. */
@Schema({ _id: false })
export class OrderShippingAddress {
    @Prop({ required: false, name: 'address', type: mongoose.Schema.Types.ObjectId, ref: 'Address' })
    address?: Address;

    @Prop({ required: false, name: 'name', type: String })
    name?: string;

    @Prop({ required: true, name: 'street', type: String })
    street: string;

    @Prop({ required: false, name: 'number', type: Number })
    number?: number;

    @Prop({ required: true, name: 'zipCode', type: String })
    zipCode: string;

    @Prop({ required: false, name: 'description', type: String })
    description?: string;

    @Prop({ required: false, name: 'floorAddress', type: String })
    floorAddress?: string;
}

export const OrderShippingAddressSchema = SchemaFactory.createForClass(OrderShippingAddress);

/**
 * Loose buyer snapshot for counter sales, where there is usually no account.
 * Every field is optional: a walk-in customer may give nothing at all.
 */
@Schema({ _id: false })
export class OrderCustomer {
    @Prop({ required: false, name: 'name', type: String, trim: true })
    name?: string;

    @Prop({ required: false, name: 'email', type: String, trim: true, lowercase: true })
    email?: string;

    @Prop({ required: false, name: 'phone', type: String, trim: true })
    phone?: string;

    @Prop({ required: false, name: 'taxId', type: String, trim: true })
    taxId?: string;
}

export const OrderCustomerSchema = SchemaFactory.createForClass(OrderCustomer);

@Schema({ collection: 'order', timestamps: true })
export class Order {
    /**
     * Human-facing consecutive number, handed out by the `order` sequence in the
     * counter collection. Sparse so the unique index tolerates documents written
     * before this field existed, until the backfill migration reaches them.
     */
    @Prop({ required: true, name: 'orderNumber', type: Number, unique: true, sparse: true })
    orderNumber: number;

    /** Optional: a point-of-sale walk-in has no account behind it. */
    @Prop({ required: false, name: 'user', type: mongoose.Schema.Types.ObjectId, ref: 'User', index: true })
    user?: User;

    @Prop({ required: true, name: 'items', type: [OrderItemSchema], default: [] })
    items: OrderItem[];

    /** Gross sum of the lines, before discounts. */
    @Prop({ required: true, name: 'subTotalPrice', type: Number, min: 0, default: 0 })
    subTotalPrice: number;

    /** Sum of the line discounts. Shipping is never discounted. */
    @Prop({ required: false, name: 'discountTotal', type: Number, min: 0, default: 0 })
    discountTotal: number;

    @Prop({ required: false, name: 'appliedPromotions', type: [OrderAppliedPromotionSchema], default: [] })
    appliedPromotions: OrderAppliedPromotion[];

    /** The coupon code actually redeemed, if any. */
    @Prop({ required: false, name: 'coupon', type: String, uppercase: true, trim: true })
    coupon: string;

    @Prop({ required: true, name: 'shippingPrice', type: Number, min: 0, default: 0 })
    shippingPrice: number;

    @Prop({ required: true, name: 'totalPrice', type: Number, min: 0, default: 0 })
    totalPrice: number;

    @Prop({ required: true, name: 'paymentMethod', type: mongoose.Schema.Types.ObjectId, ref: 'CatPaymentMethod' })
    paymentMethod: CatPaymentMethod;

    @Prop({ required: true, name: 'shippingType', type: String })
    shippingType: string;

    @Prop({ required: false, name: 'shippingAddress', type: OrderShippingAddressSchema })
    shippingAddress?: OrderShippingAddress;

    @Prop({ required: true, name: 'status', type: mongoose.Schema.Types.ObjectId, ref: 'CatOrderStatus', index: true })
    status: CatOrderStatus;

    /** Guards the cancel flow so stock is never given back twice. */
    @Prop({ required: true, name: 'stockRestored', type: Boolean, default: false })
    stockRestored: boolean;

    /**
     * Where the sale happened. Kept as a plain string, unlike `status`, because
     * there is no channel catalogue and `src/core` must not import from a feature
     * module. Documents created before the point-of-sale feature have no such
     * field: reads treat missing as ONLINE.
     */
    @Prop({ required: true, name: 'channel', type: String, default: 'ONLINE' })
    channel: string;

    /** Operator who rang up a counter sale. Absent on online orders. */
    @Prop({ required: false, name: 'soldBy', type: mongoose.Schema.Types.ObjectId, ref: 'User', index: true })
    soldBy?: User;

    /** Buyer data of a counter sale, snapshotted like the shipping address. */
    @Prop({ required: false, name: 'customer', type: OrderCustomerSchema })
    customer?: OrderCustomer;
}

export const OrderSchema = SchemaFactory.createForClass(Order);

/** Every analytics range query filters revenue statuses then cuts by date. */
OrderSchema.index({ status: 1, createdAt: -1 });

/** Range scans with no status predicate, plus the admin order listing sort. */
OrderSchema.index({ createdAt: -1 });

/** Customer cohorts and top-customer rankings group by user. */
OrderSchema.index({ user: 1, createdAt: -1 });

/** Dead-stock `distinct()` and the existing hasPurchasedProduct() lookup. */
OrderSchema.index({ 'items.product': 1, status: 1 });

/**
 * Twin of the index above for products sold inside a combo: without it, both
 * dead-stock and hasPurchasedProduct() would collection-scan for them.
 */
OrderSchema.index({ 'items.components.product': 1, status: 1 });

/** Auditing a coupon: which orders redeemed it, newest first. */
OrderSchema.index({ coupon: 1, createdAt: -1 }, { sparse: true });

/** Point-of-sale listing: this channel, newest first. */
OrderSchema.index({ channel: 1, createdAt: -1 });
