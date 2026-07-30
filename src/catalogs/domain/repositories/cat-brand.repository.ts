import { CatBrandModel } from "../models/cat-brand.model";

export interface ICatBrandRepository {
    create(brand: CatBrandModel): Promise<CatBrandModel>;
    findById(id: string): Promise<CatBrandModel | null>;
    findAll(includeInactive?: boolean): Promise<CatBrandModel[]>;
    update(id: string, brand: CatBrandModel): Promise<CatBrandModel>;
    softDelete(id: string): Promise<CatBrandModel>;
}