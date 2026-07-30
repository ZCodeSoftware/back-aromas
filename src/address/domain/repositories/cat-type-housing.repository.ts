import { CatTypeHousingModel } from "../models/cat-type-housing.model";


export interface ICatTypeHousingRepository {
    findById(id: string): Promise<CatTypeHousingModel | null>;
}