import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose";
import { HydratedDocument } from "mongoose";


export type CatPaymentMethodDocument = HydratedDocument<CatPaymentMethod>;

@Schema({ collection: 'cat_payment_method', timestamps: true })
export class CatPaymentMethod {
    @Prop({ unique: true })
    name: string;
}

export const CatPaymentMethodSchema = SchemaFactory.createForClass(CatPaymentMethod);