import { CatEssenceModel } from "../models/cat-essence.model";
import { ICreateEssence, IUpdateEssence } from "../types/cat-essence.type";


export interface ICatEssenceService {
    create(essence: ICreateEssence): Promise<CatEssenceModel>;
    findById(id: string): Promise<CatEssenceModel>;
    findAll(includeInactive?: boolean): Promise<CatEssenceModel[]>
    update(id: string, essence: IUpdateEssence): Promise<CatEssenceModel>;
    delete(id: string): Promise<CatEssenceModel>;
}