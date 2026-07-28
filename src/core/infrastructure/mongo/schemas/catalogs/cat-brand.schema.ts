import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose";
import { HydratedDocument } from "mongoose";


export type CatBrandDocument = HydratedDocument<CatBrand>

@Schema({ collection: 'cat_brand', timestamps: true })
export class CatBrand {
    @Prop({ unique: true })
    name: string;

    @Prop({ required: false, type: Boolean, default: true })
    isActive: boolean;
}


export const CatBrandSchema = SchemaFactory.createForClass(CatBrand);