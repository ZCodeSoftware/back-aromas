import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose";
import mongoose, { HydratedDocument } from "mongoose";
import { Product } from "./product.schema";
import { User } from "./user.schema";

export type CartDocument = HydratedDocument<Cart>;

/**
 * Line item of a cart. Embedded on purpose: a cart is only ever read and
 * written as a whole, so a separate collection would only add orphans.
 * `_id: false` keeps the product reference as the natural key.
 */
@Schema({ _id: false })
export class CartItem {
    @Prop({ required: true, name: 'product', type: mongoose.Schema.Types.ObjectId, ref: 'Product' })
    product: Product;

    @Prop({ required: true, name: 'quantity', type: Number, min: 1 })
    quantity: number;

    /** Price snapshot taken when the item was added; revalidated on checkout. */
    @Prop({ required: true, name: 'unitPrice', type: Number, min: 0 })
    unitPrice: number;

    @Prop({ required: true, name: 'total', type: Number, min: 0 })
    total: number;
}

export const CartItemSchema = SchemaFactory.createForClass(CartItem);

@Schema({ collection: 'cart', timestamps: true })
export class Cart {
    @Prop({ required: true, name: 'user', type: mongoose.Schema.Types.ObjectId, ref: 'User', unique: true, index: true })
    user: User;

    @Prop({ required: false, name: 'items', type: [CartItemSchema], default: [] })
    items: CartItem[];

    @Prop({ required: true, name: 'totalPrice', type: Number, default: 0, min: 0 })
    totalPrice: number;
}

export const CartSchema = SchemaFactory.createForClass(Cart);
