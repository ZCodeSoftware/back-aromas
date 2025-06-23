import { Injectable } from "@nestjs/common";
import { InjectModel } from "@nestjs/mongoose";
import { Model } from "mongoose";
import { CatSubCategoryModel } from "../../../domain/models/cat-sub-cartegory.model";
import { ICatSubCategoryRepository } from "../../../domain/repositories/cat-sub-cartegory.repository";
import { CatSubCategorySchema } from "../schemas/cat-sub-category.schema";

@Injectable()
export class CatSubCategoryRepository implements ICatSubCategoryRepository {
    constructor(
        @InjectModel('CatSubCategory') private readonly catSubCategoryDB: Model<CatSubCategorySchema>
    ) { }
    async findById(id: string): Promise<CatSubCategoryModel | null> {
        const subCategory = await this.catSubCategoryDB.findById(id);
        if (!subCategory) return null;
        return CatSubCategoryModel.hydrate(subCategory);
    }
}