import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose";
import mongoose, { HydratedDocument } from "mongoose";
import { Product } from "./product.schema";

export type MetricsDocument = HydratedDocument<Metrics>;

/** One counter document per product, created lazily on the first event. */
@Schema({ collection: 'metrics', timestamps: true })
export class Metrics {
    @Prop({ required: true, name: 'product', type: mongoose.Schema.Types.ObjectId, ref: 'Product', unique: true, index: true })
    product: Product;

    @Prop({ required: true, name: 'seeTimes', type: Number, default: 0, min: 0 })
    seeTimes: number;

    @Prop({ required: true, name: 'sellTimes', type: Number, default: 0, min: 0 })
    sellTimes: number;

    @Prop({ required: true, name: 'addCartTimes', type: Number, default: 0, min: 0 })
    addCartTimes: number;
}

export const MetricsSchema = SchemaFactory.createForClass(Metrics);
