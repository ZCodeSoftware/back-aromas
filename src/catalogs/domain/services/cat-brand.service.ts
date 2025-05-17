import { CatBrandModel } from "../models/cat-brand.model";
import { ICreateBrand } from "../types/cat-brand.type";


export interface ICatBrandService {
    create(brand: ICreateBrand): Promise<CatBrandModel>;
    findById(id: string): Promise<CatBrandModel | null>;
    findAll(): Promise<CatBrandModel[]>
}