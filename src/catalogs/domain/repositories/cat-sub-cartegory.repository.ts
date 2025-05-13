import { CatSubCategoryModel } from "../models/cat-sub-cartegory.model";

export interface ICatSubCategoryRepository {
    create(subCategory: CatSubCategoryModel): Promise<CatSubCategoryModel>;
    findById(id: string): Promise<CatSubCategoryModel | null>;
    findAll(): Promise<CatSubCategoryModel[]>;
}

