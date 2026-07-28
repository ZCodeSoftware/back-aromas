import { CatTypeHousingModel } from "../models/cat-type-housing.model";
import { ICreateTypeHousing, IUpdateTypeHousing } from "../types/cat-type-housing.type";

export interface ICatTypeHousingService {
    create(typeHousing: ICreateTypeHousing): Promise<CatTypeHousingModel>;
    findById(id: string): Promise<CatTypeHousingModel>;
    findAll(): Promise<CatTypeHousingModel[]>;
    update(id: string, typeHousing: IUpdateTypeHousing): Promise<CatTypeHousingModel>;
    delete(id: string): Promise<CatTypeHousingModel>;

}