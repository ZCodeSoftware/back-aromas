import { HttpStatus, Injectable } from "@nestjs/common";
import { InjectModel } from "@nestjs/mongoose";
import { Model } from "mongoose";
import { BaseErrorException } from "../../../../core/domain/exceptions/base.error.exception";
import { CATEGORY_RELATIONS } from "../../../../core/infrastructure/nest/constants/relations.constant";
import { CatCategoryModel } from "../../../domain/models/cat-category.model";
import { ICatCategoryRepository } from "../../../domain/repositories/cat-categories.repository";
import { CatCategorySchema } from "../schemas/cat-category.schema";



@Injectable()
export class CatCategoryRepository implements ICatCategoryRepository {
    constructor(
        @InjectModel('CatCategory') private readonly catCategoryDB: Model<CatCategorySchema>
    ) { }

    async create(category: CatCategoryModel): Promise<CatCategoryModel> {
        const schema = new this.catCategoryDB(category.toJSON());
        const newCategory = await schema.save();

        if (!newCategory) throw new BaseErrorException(`Category Shouldn't be created`, HttpStatus.BAD_REQUEST)

        return CatCategoryModel.hydrate(newCategory);
    }

    async findAll(): Promise<CatCategoryModel[]> {
        const categories = await this.catCategoryDB.find().populate('subCategories')

        return categories.map((c) => CatCategoryModel.hydrate(c))
    }

    async findById(id: string): Promise<CatCategoryModel | null> {
        const category = await this.catCategoryDB.findById(id).populate('subCategories')

        if (!category) return null;
        return CatCategoryModel.hydrate(category)
    }

    async update(id: string, updateToCategory: CatCategoryModel) {
        const updateObject = updateToCategory.toJSON();

        const filteredUpdateObject = Object.fromEntries(
            Object.entries(updateObject).filter(([key, value]) => {
                if (CATEGORY_RELATIONS.includes(key)) {
                    return (value !== null && value !== undefined && typeof value === 'object');
                }
                return value !== null && value !== undefined;
            }))

        const categoryToUpdate = await this.catCategoryDB.findByIdAndUpdate(id, filteredUpdateObject, { new: true, omitUndefined: true })

        if (!categoryToUpdate) throw new BaseErrorException(`Category Shouldn't be updated`, HttpStatus.BAD_REQUEST)

        return CatCategoryModel.hydrate(categoryToUpdate)
    }
}