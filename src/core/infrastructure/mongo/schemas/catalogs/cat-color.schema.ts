import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose";
import { HydratedDocument } from "mongoose";


export type CatColorDocument = HydratedDocument<CatColor>;

@Schema({ collection: 'cat_color', timestamps: true })
export class CatColor {
    @Prop({ unique: true })
    name: string;

    @Prop()
    hex: string;
}

export const CatColorSchema = SchemaFactory.createForClass(CatColor);