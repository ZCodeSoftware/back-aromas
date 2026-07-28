import { CatColorModel } from "../models/cat-color.model";

export interface ICatColorRepository{
    create(color: CatColorModel): Promise<CatColorModel>;
    findById(id:string):Promise<CatColorModel|null>;
    findAll():Promise<CatColorModel[]>
    update(id: string, color: CatColorModel): Promise<CatColorModel>;
    softDelete(id: string): Promise<CatColorModel>;
}