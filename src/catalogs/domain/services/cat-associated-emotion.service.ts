import { CatAssociatedEmotionModel } from "../models/cat-associated-emotion.model";
import { ICreateAssociatedEmotion, IUpdateAssociatedEmotion } from "../types/cat-associated-emotion.type";


export interface ICatAssociatedEmotionService {
    create(catalogs: ICreateAssociatedEmotion): Promise<CatAssociatedEmotionModel>;
    findById(id: string):Promise<CatAssociatedEmotionModel | null>;
    findAll():Promise<CatAssociatedEmotionModel[]>
    update(id: string, associatedEmotion: IUpdateAssociatedEmotion): Promise<CatAssociatedEmotionModel>;
    delete(id: string): Promise<CatAssociatedEmotionModel>;
}