import { CatEssenceModel } from "../models/cat-essence.model";


export interface ICatEssenceRepository {
    create(essence: CatEssenceModel): Promise<CatEssenceModel>;
    findById(id: string): Promise<CatEssenceModel | null>;
    findAll(): Promise<CatEssenceModel[]>
}