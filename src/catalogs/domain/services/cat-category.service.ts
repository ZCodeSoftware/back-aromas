import { CatCategoryModel } from "../models/cat-category.model";
import { ICreateCategory, IUpdateCategory } from "../types/cat-category.type";


export interface ICatCategoryService {
    create(category: ICreateCategory): Promise<CatCategoryModel>;
    findById(id: string): Promise<CatCategoryModel | null>;
    findAll(): Promise<CatCategoryModel[]>;
    update(id: string, updateCategory: IUpdateCategory): Promise<CatCategoryModel>;
    delete(id: string): Promise<CatCategoryModel>;
}