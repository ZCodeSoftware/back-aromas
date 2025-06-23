import { CatSubCategoryModel } from "../models/cat-sub-cartegory.model";

export interface ICatSubCategoryRepository {
    findById(id: string): Promise<CatSubCategoryModel | null>;
}

