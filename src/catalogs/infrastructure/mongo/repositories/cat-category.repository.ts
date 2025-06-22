import { HttpStatus, Injectable } from "@nestjs/common";
import { ICatCategoryRepository } from "../../../domain/repositories/cat-categories.repository";
import { InjectModel } from "@nestjs/mongoose";
import { Model } from "mongoose";
import { CatCategorySchema } from "../schemas/cat-category.schema";
import { CatCategoryModel } from "../../../domain/models/cat-category.model";
import { BaseErrorException } from "../../../../core/domain/exceptions/base.error.exception";



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
        const categoryToUpdate = this.catCategoryDB.findByIdAndUpdate(id, updateToCategory.toJSON(), { new: true })

        if (!categoryToUpdate) throw new BaseErrorException(`Category Shouldn't be updated`, HttpStatus.BAD_REQUEST)

        return CatCategoryModel.hydrate(categoryToUpdate)
    }
}