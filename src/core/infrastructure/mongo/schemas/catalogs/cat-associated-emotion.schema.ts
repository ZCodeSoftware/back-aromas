import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose";
import { HydratedDocument } from "mongoose";


export type CatAssociatedEmotionDocument = HydratedDocument<CatAssociatedEmotion>;

@Schema({ collection: 'cat_associated_emotion', timestamps: true })
export class CatAssociatedEmotion {
    @Prop({ unique: true })
    name: string;
}

export const CatAssociatedEmotionSchema = SchemaFactory.createForClass(CatAssociatedEmotion);