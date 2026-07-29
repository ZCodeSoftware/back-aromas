import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose";
import mongoose, { HydratedDocument } from "mongoose";
import { CatOrderStatus } from "../catalogs/cat-order-status.schema";
import { CatPaymentMethod } from "../catalogs/cat-payment-method.schema";
import { Address } from "./address.schema";
import { Product } from "./product.schema";
import { User } from "./user.schema";

export type OrderDocument = HydratedDocument<Order>;

/**
 * Immutable snapshot of a purchased line. `name` and `unitPrice` are copied on
 * purpose: a later price change or a deleted product must not rewrite history.
 */
@Schema({ _id: false })
export class OrderItem {
    @Prop({ required: true, name: 'product', type: mongoose.Schema.Types.ObjectId, ref: 'Product' })
    product: Product;

    @Prop({ required: true, name: 'name', type: String })
    name: string;

    @Prop({ required: true, name: 'unitPrice', type: Number, min: 0 })
    unitPrice: number;

    @Prop({ required: true, name: 'quantity', type: Number, min: 1 })
    quantity: number;

    @Prop({ required: true, name: 'total', type: Number, min: 0 })
    total: number;
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
    /** Optional: a point-of-sale walk-in has no account behind it. */
    @Prop({ required: false, name: 'user', type: mongoose.Schema.Types.ObjectId, ref: 'User', index: true })
    user?: User;

    @Prop({ required: true, name: 'items', type: [OrderItemSchema], default: [] })
    items: OrderItem[];

    @Prop({ required: true, name: 'subTotalPrice', type: Number, min: 0, default: 0 })
    subTotalPrice: number;

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

/** Point-of-sale listing: this channel, newest first. */
OrderSchema.index({ channel: 1, createdAt: -1 });
