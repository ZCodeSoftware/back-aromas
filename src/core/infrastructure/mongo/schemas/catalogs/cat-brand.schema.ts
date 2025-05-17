import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose";
import { HydratedDocument } from "mongoose";


export type CatBrandDocument = HydratedDocument<CatBrand>

@Schema({ collection: 'cat_brand', timestamps: true })
export class CatBrand {
    @Prop({ unique: true })
    name: string;
}


export const CatBrandSchema = SchemaFactory.createForClass(CatBrand);