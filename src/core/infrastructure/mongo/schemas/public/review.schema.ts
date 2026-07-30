import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose";
import mongoose, { HydratedDocument } from "mongoose";
import { Product } from "./product.schema";
import { User } from "./user.schema";

export type ReviewDocument = HydratedDocument<Review>;

@Schema({ collection: 'review', timestamps: true })
export class Review {
    @Prop({ required: true, name: 'user', type: mongoose.Schema.Types.ObjectId, ref: 'User' })
    user: User;

    @Prop({ required: true, name: 'product', type: mongoose.Schema.Types.ObjectId, ref: 'Product' })
    product: Product;

    @Prop({ required: true, name: 'rating', type: Number, min: 1, max: 5 })
    rating: number;

    @Prop({ required: false, name: 'comment', type: String, trim: true, maxlength: 500 })
    comment: string;

    @Prop({ required: false, name: 'isActive', type: Boolean, default: true })
    isActive: boolean;
}

export const ReviewSchema = SchemaFactory.createForClass(Review);

/** One review per customer and product; enforced by the database, not by a read-then-write. */
ReviewSchema.index({ user: 1, product: 1 }, { unique: true });
