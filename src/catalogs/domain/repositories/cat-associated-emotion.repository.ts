import { CatAssociatedEmotionModel } from "../models/cat-associated-emotion.model";

export interface ICatAssociatedEmotionRepository{
    create(associatedEmotion: CatAssociatedEmotionModel): Promise<CatAssociatedEmotionModel>;
    findById(id:string):Promise<CatAssociatedEmotionModel|null>;
    findAll():Promise<CatAssociatedEmotionModel[]>
}