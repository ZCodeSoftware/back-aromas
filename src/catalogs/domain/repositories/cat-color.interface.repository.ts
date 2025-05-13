import { CatColorModel } from "../models/cat-color.model";

export interface ICatColorRepository{
    create(color: CatColorModel): Promise<CatColorModel>;
    findById(id:string):Promise<CatColorModel|null>;
    findAll():Promise<CatColorModel[]>
}