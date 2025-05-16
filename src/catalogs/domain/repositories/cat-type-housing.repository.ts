import { CatTypeHousingModel } from "../models/cat-type-housing.model";


export interface ICatTypeHousingRepository{
    create(typeHousing : CatTypeHousingModel): Promise<CatTypeHousingModel>;
    findById(id:string): Promise<CatTypeHousingModel|null>;
    findAll():Promise<CatTypeHousingModel[]>
}