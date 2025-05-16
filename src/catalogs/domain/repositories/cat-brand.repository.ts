import { CatBrandModel } from "../models/cat-brand.model";

export interface ICatBrandRepository {
    create(brand: CatBrandModel): Promise<CatBrandModel>;
    findById(id: string): Promise<CatBrandModel | null>;
    findAll(): Promise<CatBrandModel[]>;
}