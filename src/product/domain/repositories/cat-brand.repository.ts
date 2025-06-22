import { CatBrandModel } from "../models/cat-brand.model";

export interface ICatBrandRepository {
    findById(id: string): Promise<CatBrandModel | null>;
}