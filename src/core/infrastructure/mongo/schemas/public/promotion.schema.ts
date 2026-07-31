import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose";
import mongoose, { HydratedDocument } from "mongoose";
import { CatCategory } from "../catalogs/cat-category.schema";
import { CatSubCategory } from "../catalogs/cat-sub-category.schema";
import { Combo } from "./combo.schema";
import { Product } from "./product.schema";

export type PromotionDocument = HydratedDocument<Promotion>;

/**
 * A single discount rule. One entity covers every case the shop needs: a coupon
 * is just a promotion that carries a `code`, a limited-time sale is one that
 * carries dates, and a category sale is one whose `scope` is CATEGORY. Splitting
 * them would duplicate the matching and the usage accounting for no gain.
 */
@Schema({ collection: 'promotion', timestamps: true })
export class Promotion {
    @Prop({ required: true, name: 'name', type: String, trim: true, minlength: 3, maxlength: 100 })
    name: string;

    @Prop({ required: false, name: 'description', type: String, trim: true, maxlength: 300 })
    description: string;

    /**
     * ALL | CATEGORY | SUBCATEGORY | PRODUCTS | COMBOS. Plain string for the same
     * reason as `Order.channel`: no catalogue behind it, and `src/core` must not
     * import an enum from a feature module.
     */
    @Prop({ required: true, name: 'scope', type: String, default: 'ALL' })
    scope: string;

    @Prop({ required: false, name: 'categories', type: [{ type: mongoose.Schema.Types.ObjectId, ref: 'CatCategory' }], default: [] })
    categories: CatCategory[];

    @Prop({ required: false, name: 'sub_categories', type: [{ type: mongoose.Schema.Types.ObjectId, ref: 'CatSubCategory' }], default: [] })
    subCategories: CatSubCategory[];

    @Prop({ required: false, name: 'products', type: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Product' }], default: [] })
    products: Product[];

    @Prop({ required: false, name: 'combos', type: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Combo' }], default: [] })
    combos: Combo[];

    /** PERCENTAGE | FIXED. */
    @Prop({ required: true, name: 'valueType', type: String })
    valueType: string;

    @Prop({ required: true, name: 'value', type: Number, min: 0 })
    value: number;

    /** Absent means automatic: it applies on its own, with nothing to type in. */
    @Prop({ required: false, name: 'code', type: String, trim: true, uppercase: true })
    code: string;

    @Prop({ required: false, name: 'startsAt', type: Date })
    startsAt: Date;

    @Prop({ required: false, name: 'endsAt', type: Date })
    endsAt: Date;

    /** Checked against the gross cart subtotal, shipping excluded. */
    @Prop({ required: false, name: 'minPurchase', type: Number, min: 0 })
    minPurchase: number;

    @Prop({ required: false, name: 'usageLimit', type: Number, min: 1 })
    usageLimit: number;

    @Prop({ required: false, name: 'usageLimitPerUser', type: Number, min: 1 })
    usageLimitPerUser: number;

    /** Incremented atomically at checkout; the guard against overselling a coupon. */
    @Prop({ required: true, name: 'usedCount', type: Number, min: 0, default: 0 })
    usedCount: number;

    @Prop({ required: false, name: 'is_active', type: Boolean, default: true })
    isActive: boolean;
}

export const PromotionSchema = SchemaFactory.createForClass(Promotion);

/** Sparse: most promotions are automatic and carry no code at all. */
PromotionSchema.index({ code: 1 }, { unique: true, sparse: true });

/** Every checkout and preview sweeps the automatic promotions in force right now. */
PromotionSchema.index({ isActive: 1, startsAt: 1, endsAt: 1 });
