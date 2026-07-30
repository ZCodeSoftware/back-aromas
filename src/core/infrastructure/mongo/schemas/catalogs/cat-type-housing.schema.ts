import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose";
import { HydratedDocument } from "mongoose";


export type CatTypeHousingDocument = HydratedDocument<CatTypeHousing>;

@Schema({ collection: 'cat_type_housing', timestamps: true })
export class CatTypeHousing {
    @Prop({ unique: true })
    name: string;

    @Prop({ required: false, type: Boolean, default: true })
    isActive: boolean;
}

export const CatTypeHousingSchema = SchemaFactory.createForClass(CatTypeHousing);