import { HttpStatus, Inject, Injectable } from "@nestjs/common";
import { ICatSubCategoryService } from "../../domain/services/cat-sub-category.service";
import SymbolsCatalogs from "../../symbols-catalogs";
import { ICatSubCategoryRepository } from "../../domain/repositories/cat-sub-cartegory.repository";
import { CatSubCategoryModel } from "../../domain/models/cat-sub-cartegory.model";
import { ICreateSubCategory } from "../../domain/types/cat-sub-category.type";
import { BaseErrorException } from "../../../core/domain/exceptions/base.error.exception";




@Injectable()
export class CatSubCategoryService implements ICatSubCategoryService {
    constructor(
        @Inject(SymbolsCatalogs.ICatSubCategoryRepository)
         private readonly catSubCategoryRepository: ICatSubCategoryRepository
    ){}

    async create(subCategory: ICreateSubCategory): Promise<CatSubCategoryModel> {
        const catSubCatModel = CatSubCategoryModel.create(subCategory);
        return await this.catSubCategoryRepository.create(catSubCatModel);
    }

    async findById(id:string): Promise<CatSubCategoryModel>{
        const subCategory = await this.catSubCategoryRepository.findById(id)
        if(!subCategory){
            throw new BaseErrorException("SubCategory not found", HttpStatus.BAD_REQUEST)
        }
        return subCategory;
    }

    async findAll(): Promise<CatSubCategoryModel[]> {
        return await this.catSubCategoryRepository.findAll();
    }
}