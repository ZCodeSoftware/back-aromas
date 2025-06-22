import { HttpStatus, Inject, Injectable } from "@nestjs/common";
import { ICatCategoryService } from "../../domain/services/cat-category.service";
import SymbolsCatalogs from "../../symbols-catalogs";
import { ICatCategoryRepository } from "../../domain/repositories/cat-categories.repository";
import { CatCategoryModel } from "../../domain/models/cat-category.model";
import { ICreateCategory } from "../../domain/types/cat-category.type";
import { BaseErrorException } from "../../../core/domain/exceptions/base.error.exception";
import { ICatSubCategoryRepository } from "../../domain/repositories/cat-sub-cartegory.repository";

@Injectable()
export class CatCategoryService implements ICatCategoryService {
    constructor(
        @Inject(
            SymbolsCatalogs.ICatCategoryRepository
        ) private readonly catCategoryRepository: ICatCategoryRepository,
        @Inject(
            SymbolsCatalogs.ICatSubCategoryRepository
        ) private readonly catSubCategoryRepository: ICatSubCategoryRepository
    ) { }

    async create(category: ICreateCategory): Promise<CatCategoryModel> {
        const { subCategories, ...rest } = category


        const catCategoryModel = CatCategoryModel.create(rest);

        if (subCategories) {
            await Promise.all(subCategories.map(async (s) => {
                const subCategory = await this.catSubCategoryRepository.findById(s)

                if (!subCategory) return

                catCategoryModel.addSubCategory(subCategory)
            }))
        }

        return await this.catCategoryRepository.create(catCategoryModel);
    }

    async findAll(): Promise<CatCategoryModel[]> {
        return await this.catCategoryRepository.findAll();
    }

    async findById(id: string): Promise<CatCategoryModel | null> {
        const categories = await this.catCategoryRepository.findById(id)

        if (!categories) {
            throw new BaseErrorException("Category not found", HttpStatus.BAD_REQUEST)
        }

        return categories
    }

    async update(id: string, updateCategory: Partial<ICreateCategory>): Promise<CatCategoryModel> {
        const { subCategories, ...rest } = updateCategory


        const catCategoryModel = CatCategoryModel.create(rest);

        if (subCategories) {
            await Promise.all(subCategories.map(async (s) => {
                const subCategory = await this.catSubCategoryRepository.findById(s)

                if (!subCategory) return

                catCategoryModel.addSubCategory(subCategory)
            }))
        }


        const categoryToUpdate = await this.catCategoryRepository.update(id, catCategoryModel);




        return categoryToUpdate
    }

}