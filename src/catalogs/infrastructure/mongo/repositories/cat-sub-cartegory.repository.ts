import { Model } from "mongoose";
import { HttpStatus, Injectable } from "@nestjs/common";
import { InjectModel } from "@nestjs/mongoose";
import { CatSubCategorySchema } from "../schemas/cat-sub-category.schema";
import { CatSubCategoryModel } from "../../../domain/models/cat-sub-cartegory.model";
import { ICatSubCategoryRepository } from "../../../domain/repositories/cat-sub-cartegory.repository";
import { BaseErrorException } from "../../../../core/domain/exceptions/base.error.exception";

@Injectable()
export class CatSubCategoryRepository implements ICatSubCategoryRepository {
    constructor(
        @InjectModel('CatSubCategory') private readonly catSubCategoryDB: Model<CatSubCategorySchema>
    ) { }

    async create( catSubCategory: CatSubCategoryModel) : Promise<CatSubCategoryModel> {
        const schema = new this.catSubCategoryDB(catSubCategory.toJSON());
        const newCatSubCategory = await schema.save();

        if (!newCatSubCategory) throw new BaseErrorException(`SubCategory shouldn't be created`, HttpStatus.BAD_REQUEST);

        return CatSubCategoryModel.hydrate(newCatSubCategory);
    }

    async findById(id: string): Promise<CatSubCategoryModel | null> {
        const subCategory = await this.catSubCategoryDB.findById(id);
        if (!subCategory) return null;
        return CatSubCategoryModel.hydrate(subCategory);
    }

    async findAll( ): Promise<CatSubCategoryModel[]> {
        const subCategories = await this.catSubCategoryDB.find();

        return subCategories.map((subCat)=> CatSubCategoryModel.hydrate(subCat));
    }

}