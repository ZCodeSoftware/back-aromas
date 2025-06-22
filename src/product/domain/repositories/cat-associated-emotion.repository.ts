import { CatAssociatedEmotionModel } from "../models/cat-associated-emotion.model";

export interface ICatAssociatedEmotionRepository {
    findById(id: string): Promise<CatAssociatedEmotionModel | null>;
}