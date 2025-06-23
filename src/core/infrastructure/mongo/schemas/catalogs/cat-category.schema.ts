import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose";
import mongoose, { HydratedDocument } from "mongoose";
import { CatSubCategory } from "./cat-sub-category.schema";

export type CatCategoryDocument = HydratedDocument<CatCategory>;

@Schema({ collection: 'cat_categories', timestamps: true })
export class CatCategory {
    @Prop({ unique: true })
    name: string;

    @Prop({
        type: [{ type: mongoose.Schema.Types.ObjectId, ref: 'CatSubCategory' }],
        required: false,
        name: 'sub_categories',
        default: []
    })
    subCategories: CatSubCategory[]
}

export const CatCategorySchema = SchemaFactory.createForClass(CatCategory)