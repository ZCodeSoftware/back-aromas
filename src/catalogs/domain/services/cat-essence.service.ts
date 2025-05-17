import { CatEssenceModel } from "../models/cat-essence.model";
import { ICreateEssence } from "../types/cat-essence.type";


export interface ICatEssenceService {
    create(essence: ICreateEssence): Promise<CatEssenceModel>;
    findById(id: string): Promise<CatEssenceModel>;
    findAll(): Promise<CatEssenceModel[]>
}