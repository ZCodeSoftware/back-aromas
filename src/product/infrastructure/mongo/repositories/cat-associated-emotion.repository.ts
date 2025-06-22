import { Injectable } from "@nestjs/common";
import { InjectModel } from "@nestjs/mongoose";
import { Model } from "mongoose";
import { CatAssociatedEmotionModel } from "../../../domain/models/cat-associated-emotion.model";
import { ICatAssociatedEmotionRepository } from "../../../domain/repositories/cat-associated-emotion.repository";
import { CatAssociatedEmotionSchema } from "../schemas/cat-associated-emotion.schema";


@Injectable()
export class CatAssociatedEmotionRepository implements ICatAssociatedEmotionRepository {
    constructor(
        @InjectModel('CatAssociatedEmotion') private readonly catAssociatedEmotionDB: Model<CatAssociatedEmotionSchema>
    ) { }
    async findById(id: string): Promise<CatAssociatedEmotionModel | null> {
        const associatedEmotion = await this.catAssociatedEmotionDB.findById(id);
        if (!associatedEmotion) return null;

        return CatAssociatedEmotionModel.hydrate(associatedEmotion);
    }
}