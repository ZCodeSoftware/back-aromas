import { CatBrandModel } from "../models/cat-brand.model";
import { ICreateBrand, IUpdateBrand } from "../types/cat-brand.type";


export interface ICatBrandService {
    create(brand: ICreateBrand): Promise<CatBrandModel>;
    findById(id: string): Promise<CatBrandModel | null>;
    findAll(): Promise<CatBrandModel[]>
    update(id: string, brand: IUpdateBrand): Promise<CatBrandModel>;
    delete(id: string): Promise<CatBrandModel>;
}