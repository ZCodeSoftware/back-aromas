import { CatColorModel } from "../models/cat-color.model";

export interface ICatColorRepository {
    findById(id: string): Promise<CatColorModel | null>;
}