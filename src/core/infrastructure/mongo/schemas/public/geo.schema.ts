import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose";
import { HydratedDocument } from "mongoose";

export type GeoDocument = HydratedDocument<Geo>;

@Schema({ collection: 'geo', timestamps: true })
export class Geo {
    @Prop({ type: String, required: true })
    lat: string;

    @Prop({ type: String, required: true })
    lng: string;
}

export const GeoSchema = SchemaFactory.createForClass(Geo);
