import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose";
import { HydratedDocument } from "mongoose";

export type CatEseenceDocument = HydratedDocument<CatEssence>

@Schema({ collection: 'cat_essence', timestamps: true })
export class CatEssence {
    @Prop({ unique: true })
    name: string;

    @Prop({ required: false, type: Boolean, default: true })
    isActive: boolean;
}

export const CatEssenceSchema = SchemaFactory.createForClass(CatEssence);