import { CatTypeHousingModel } from "../models/cat-type-housing.model";
import { ICreateTypeHousing } from "../types/cat-type-housing.type";

export interface ICatTypeHousingService {
    create(typeHousing: ICreateTypeHousing): Promise<CatTypeHousingModel>;
    findById(id: string): Promise<CatTypeHousingModel>;
    findAll(): Promise<CatTypeHousingModel[]>;

}