import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument } from 'mongoose';

export type CatSubCategoryDocument = HydratedDocument<CatSubCategory>;

@Schema({ collection: 'cat_sub_category', timestamps: true })
export class CatSubCategory {
  @Prop({ unique: true })
  name: string;

  @Prop({ required: false, type: Boolean, default: true })
  isActive: boolean;
}

export const CatSubCategorySchema = SchemaFactory.createForClass(CatSubCategory);
