import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose";
import mongoose, { HydratedDocument } from "mongoose";
import { CatAssociatedEmotion } from "../catalogs/cat-associated-emotion.schema";
import { CatBrand } from "../catalogs/cat-brand.schema";
import { CatCategory } from "../catalogs/cat-category.schema";
import { CatColor } from "../catalogs/cat-color.schema";
import { CatEssence } from "../catalogs/cat-essence.schema";
import { CatSubCategory } from "../catalogs/cat-sub-category.schema";

export type ProductDocument = HydratedDocument<Product>;

@Schema({ collection: 'product', timestamps: true })
export class Product {
    @Prop({ required: true, name: 'name', type: String, trim: true, minlength: 3, maxlength: 100 })
    name: string;

    @Prop({ required: false, name: 'description', type: String, trim: true, minlength: 10, maxlength: 500 })
    description: string;

    @Prop({ required: true, name: 'price', type: Number, min: 0, default: 0 })
    price: number;

    @Prop({ required: false, name: 'images', type: [String] })
    images: string[];

    @Prop({ required: false, name: 'is_active', type: Boolean, default: true })
    isActive: boolean;

    @Prop({ required: true, name: 'stock', type: Number, default: 0, min: 0 })
    stock: number;

    @Prop({ required: false, name: 'color', type: mongoose.Schema.Types.ObjectId, ref: 'CatColor' })
    color: CatColor;

    @Prop({ required: false, name: 'essence', type: mongoose.Schema.Types.ObjectId, ref: 'CatEssence' })
    essence: CatEssence;

    @Prop({ required: false, name: 'associated_emotion', type: mongoose.Schema.Types.ObjectId, ref: 'CatAssociatedEmotion' })
    associatedEmotion: CatAssociatedEmotion;

    @Prop({ required: false, name: 'brand', type: mongoose.Schema.Types.ObjectId, ref: 'CatBrand' })
    brand: CatBrand;

    @Prop({ required: true, name: 'category', type: mongoose.Schema.Types.ObjectId, ref: 'CatCategory' })
    category: CatCategory;

    @Prop({ required: false, name: 'sub_category', type: mongoose.Schema.Types.ObjectId, ref: 'CatSubCategory' })
    subCategory: CatSubCategory;
}

export const ProductSchema = SchemaFactory.createForClass(Product);
