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
        const subCategory = await this.catSubCategoryDB.findOne({ _id: id, isActive: true });
        if (!subCategory) return null;
        return CatSubCategoryModel.hydrate(subCategory);
    }

    async findAll(includeInactive = false): Promise<CatSubCategoryModel[]> {
        const subCategories = await this.catSubCategoryDB.find(includeInactive ? {} : { isActive: true });

        return subCategories.map((subCat)=> CatSubCategoryModel.hydrate(subCat));
    }

    async update(id: string, subCategory: CatSubCategoryModel): Promise<CatSubCategoryModel> {
        // Undefined fields are dropped so a partial body only touches what it sends.
        const updateObject = Object.fromEntries(
            Object.entries(subCategory.toJSON()).filter(([key, value]) => value !== undefined && key !== '_id')
        );

        const subCategoryToUpdate = await this.catSubCategoryDB.findByIdAndUpdate(id, updateObject, { new: true });

        if (!subCategoryToUpdate) throw new BaseErrorException(`SubCategory not found`, HttpStatus.NOT_FOUND);

        return CatSubCategoryModel.hydrate(subCategoryToUpdate);
    }

    async softDelete(id: string): Promise<CatSubCategoryModel> {
        const subCategory = await this.catSubCategoryDB.findByIdAndUpdate(id, { isActive: false }, { new: true });

        if (!subCategory) throw new BaseErrorException(`SubCategory not found`, HttpStatus.NOT_FOUND);

        return CatSubCategoryModel.hydrate(subCategory);
    }

}
