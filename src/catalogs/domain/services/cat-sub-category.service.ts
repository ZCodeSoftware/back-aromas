import { ICreateSubCategory, IUpdateSubCategory } from '../types/cat-sub-category.type';
import { CatSubCategoryModel } from '../models/cat-sub-cartegory.model';

export interface ICatSubCategoryService {
    create(subCategory: ICreateSubCategory): Promise<CatSubCategoryModel>;
    findById(id: string): Promise<CatSubCategoryModel>;
    findAll(includeInactive?: boolean): Promise<CatSubCategoryModel[]>;
    update(id: string, subCategory: IUpdateSubCategory): Promise<CatSubCategoryModel>;
    delete(id: string): Promise<CatSubCategoryModel>;
}




