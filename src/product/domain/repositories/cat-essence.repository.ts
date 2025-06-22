import { CatEssenceModel } from "../models/cat-essence.model";


export interface ICatEssenceRepository {
    findById(id: string): Promise<CatEssenceModel | null>;
}