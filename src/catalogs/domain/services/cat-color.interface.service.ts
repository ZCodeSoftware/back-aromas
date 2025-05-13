import { CatColorModel } from "../models/cat-color.model";
import { ICreateColor } from "../types/cat-color.type";

export interface ICatColorService {
    create(catalogs: ICreateColor): Promise<CatColorModel>;
    findById(id: string): Promise<CatColorModel>;
    findAll():Promise<CatColorModel[]>;
}