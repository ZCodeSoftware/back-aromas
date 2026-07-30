import { CatEssenceModel } from "../models/cat-essence.model";


export interface ICatEssenceRepository {
    create(essence: CatEssenceModel): Promise<CatEssenceModel>;
    findById(id: string): Promise<CatEssenceModel | null>;
    findAll(includeInactive?: boolean): Promise<CatEssenceModel[]>
    update(id: string, essence: CatEssenceModel): Promise<CatEssenceModel>;
    softDelete(id: string): Promise<CatEssenceModel>;
}