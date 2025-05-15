import { CatAssociatedEmotionModel } from "../models/cat-associated-emotion.model";
import { ICreateAssociatedEmotion } from "../types/cat-associated-emotion.type";


export interface ICatAssociatedEmotionService {
    create(catalogs: ICreateAssociatedEmotion): Promise<CatAssociatedEmotionModel>;
    findById(id: string):Promise<CatAssociatedEmotionModel>;
    findAll():Promise<CatAssociatedEmotionModel[]>
}