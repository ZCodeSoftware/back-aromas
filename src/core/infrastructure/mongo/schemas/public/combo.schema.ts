import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose";
import mongoose, { HydratedDocument } from "mongoose";
import { Product } from "./product.schema";

export type ComboDocument = HydratedDocument<Combo>;

/**
 * One component of a combo: a product and how many units of it a single combo
 * carries. Embedded with `_id: false` because the product reference is the
 * natural key, same reasoning as CartItem.
 */
@Schema({ _id: false })
export class ComboItem {
    @Prop({ required: true, name: 'product', type: mongoose.Schema.Types.ObjectId, ref: 'Product' })
    product: Product;

    @Prop({ required: true, name: 'quantity', type: Number, min: 1 })
    quantity: number;
}

export const ComboItemSchema = SchemaFactory.createForClass(ComboItem);

/**
 * A bundle sold as a single line. Neither its price nor its stock is stored:
 * both are derived from the components on every read (see ComboModel), because
 * a persisted copy would go stale the moment a component price or stock moves
 * and there is no job to reconcile it.
 */
@Schema({ collection: 'combo', timestamps: true })
export class Combo {
    @Prop({ required: true, name: 'name', type: String, trim: true, minlength: 3, maxlength: 100 })
    name: string;

    @Prop({ required: false, name: 'description', type: String, trim: true, maxlength: 500 })
    description: string;

    @Prop({ required: false, name: 'images', type: [String], default: [] })
    images: string[];

    @Prop({ required: true, name: 'items', type: [ComboItemSchema], default: [] })
    items: ComboItem[];

    /**
     * FIXED | PERCENTAGE. Kept as a plain string, like `Order.channel`: there is
     * no catalogue behind it and `src/core` must not import from a feature module.
     */
    @Prop({ required: true, name: 'priceMode', type: String, default: 'FIXED' })
    priceMode: string;

    /** Set when priceMode is FIXED. */
    @Prop({ required: false, name: 'fixedPrice', type: Number, min: 0 })
    fixedPrice: number;

    /** Set when priceMode is PERCENTAGE: discount off the sum of the components. */
    @Prop({ required: false, name: 'discountPercentage', type: Number, min: 0, max: 100 })
    discountPercentage: number;

    @Prop({ required: false, name: 'is_active', type: Boolean, default: true })
    isActive: boolean;
}

export const ComboSchema = SchemaFactory.createForClass(Combo);

/** The public listing and the admin listing both cut on this first. */
ComboSchema.index({ isActive: 1 });

/** "Which combos contain this product?": needed to recheck stock after a product changes. */
ComboSchema.index({ 'items.product': 1 });
