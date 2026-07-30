import { CatColorModel } from "../models/cat-color.model";
import { ICreateColor, IUpdateColor } from "../types/cat-color.type";

export interface ICatColorService {
    create(catalogs: ICreateColor): Promise<CatColorModel>;
    findById(id: string): Promise<CatColorModel>;
    findAll(includeInactive?: boolean):Promise<CatColorModel[]>;
    update(id: string, color: IUpdateColor): Promise<CatColorModel>;
    delete(id: string): Promise<CatColorModel>;
}