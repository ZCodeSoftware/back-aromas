import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose";
import mongoose, { HydratedDocument } from "mongoose";
import { Order } from "./order.schema";
import { Promotion } from "./promotion.schema";
import { User } from "./user.schema";

export type PromotionUsageDocument = HydratedDocument<PromotionUsage>;

/**
 * One redemption of a promotion. Cannot be derived from the order collection:
 * a counter sale has no user behind it, and a coupon burnt on an order that was
 * later cancelled still counted against its limit.
 */
@Schema({ collection: 'promotion_usage', timestamps: true })
export class PromotionUsage {
    @Prop({ required: true, name: 'promotion', type: mongoose.Schema.Types.ObjectId, ref: 'Promotion' })
    promotion: Promotion;

    /** Absent on an anonymous counter sale, which skips the per-user limit. */
    @Prop({ required: false, name: 'user', type: mongoose.Schema.Types.ObjectId, ref: 'User' })
    user: User;

    @Prop({ required: false, name: 'order', type: mongoose.Schema.Types.ObjectId, ref: 'Order' })
    order: Order;

    @Prop({ required: true, name: 'discount', type: Number, min: 0 })
    discount: number;
}

export const PromotionUsageSchema = SchemaFactory.createForClass(PromotionUsage);

/** The per-user limit check: how many times has this person used this promotion. */
PromotionUsageSchema.index({ promotion: 1, user: 1 });
