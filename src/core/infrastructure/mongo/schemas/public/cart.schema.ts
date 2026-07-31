import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose";
import mongoose, { HydratedDocument } from "mongoose";
import { Combo } from "./combo.schema";
import { Product } from "./product.schema";
import { User } from "./user.schema";

export type CartDocument = HydratedDocument<Cart>;

/**
 * Line item of a cart. Embedded on purpose: a cart is only ever read and
 * written as a whole, so a separate collection would only add orphans.
 * `_id: false` keeps the product or combo reference as the natural key.
 */
@Schema({ _id: false })
export class CartItem {
    /** PRODUCT | COMBO. Lines written before combos existed are read as PRODUCT. */
    @Prop({ required: true, name: 'itemType', type: String, default: 'PRODUCT' })
    itemType: string;

    /** Set on a PRODUCT line. Optional since a COMBO line points at `combo` instead. */
    @Prop({ required: false, name: 'product', type: mongoose.Schema.Types.ObjectId, ref: 'Product' })
    product: Product;

    /** Set on a COMBO line. */
    @Prop({ required: false, name: 'combo', type: mongoose.Schema.Types.ObjectId, ref: 'Combo' })
    combo: Combo;

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

    /**
     * Gross sum of the lines. Discounts are deliberately not stored here: they
     * are computed on every preview and again at checkout, so a promotion that
     * expired meanwhile can never leave a stale amount behind.
     */
    @Prop({ required: true, name: 'totalPrice', type: Number, default: 0, min: 0 })
    totalPrice: number;

    /** Kept so the code survives a page reload; revalidated on every preview. */
    @Prop({ required: false, name: 'couponCode', type: String, trim: true, uppercase: true })
    couponCode: string;
}

export const CartSchema = SchemaFactory.createForClass(Cart);

/** Abandoned-cart snapshot: non-empty carts untouched since a cutoff. */
CartSchema.index({ updatedAt: -1 });
