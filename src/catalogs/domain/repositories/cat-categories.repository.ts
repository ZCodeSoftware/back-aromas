import { CatCategoryModel } from "../models/cat-category.model";


export interface ICatCategoryRepository {
    create(category: CatCategoryModel): Promise<CatCategoryModel>;
    findById(id: string): Promise<CatCategoryModel | null>;
    findAll(): Promise<CatCategoryModel[]>;
    update(id: string, updateCategory: CatCategoryModel): Promise<CatCategoryModel>;
}