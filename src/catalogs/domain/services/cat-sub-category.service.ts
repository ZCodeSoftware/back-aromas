import { ICreateSubCategory } from '../types/cat-sub-category.type';
import { CatSubCategoryModel } from '../models/cat-sub-cartegory.model';

export interface ICatSubCategoryService {
    create(subCategory: ICreateSubCategory): Promise<CatSubCategoryModel>;
    findById(id: string): Promise<CatSubCategoryModel>;
    findAll(): Promise<CatSubCategoryModel[]>;
}




