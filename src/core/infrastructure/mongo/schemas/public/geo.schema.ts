import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose";
import { HydratedDocument } from "mongoose";

export type GeoDocument = HydratedDocument<Geo>;

@Schema({ collection: 'geo', timestamps: true })
export class Geo {
    @Prop({ type: String, required: true })
    lat: string;

    @Prop({ type: String, required: true })
    lng: string;

    @Prop({ required: false, type: Boolean, default: true })
    isActive: boolean;
}

export const GeoSchema = SchemaFactory.createForClass(Geo);
