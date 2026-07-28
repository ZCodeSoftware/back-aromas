import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose";
import mongoose, { HydratedDocument } from "mongoose";
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

@Schema({ collection: 'order', timestamps: true })
export class Order {
    @Prop({ required: true, name: 'user', type: mongoose.Schema.Types.ObjectId, ref: 'User', index: true })
    user: User;

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

    @Prop({ required: true, name: 'status', type: String, default: 'PENDING', index: true })
    status: string;

    /** Guards the cancel flow so stock is never given back twice. */
    @Prop({ required: true, name: 'stockRestored', type: Boolean, default: false })
    stockRestored: boolean;
}

export const OrderSchema = SchemaFactory.createForClass(Order);
