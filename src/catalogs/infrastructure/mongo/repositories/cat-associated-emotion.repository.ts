import { HttpStatus, Injectable } from "@nestjs/common";
import { ICatAssociatedEmotionRepository } from "../../../domain/repositories/cat-associated-emotion.repository";
import { InjectModel } from "@nestjs/mongoose";
import { Model } from "mongoose";
import { CatAssociatedEmotionSchema } from "../schemas/cat-associated-emotion.schema";
import { CatAssociatedEmotionModel } from "../../../domain/models/cat-associated-emotion.model";
import { BaseErrorException } from "../../../../core/domain/exceptions/base.error.exception";


@Injectable()
export class CatAssociatedEmotionRepository implements ICatAssociatedEmotionRepository {
    constructor(
        @InjectModel('CatAssociatedEmotion') private readonly catAssociatedEmotionDB: Model<CatAssociatedEmotionSchema>
    ) { }

    async create(catAssociatedEmotion: CatAssociatedEmotionModel): Promise<CatAssociatedEmotionModel> {
        const schema = new this.catAssociatedEmotionDB(catAssociatedEmotion.toJSON());
        const newCatAssociatedEmotion = await schema.save();

        if (!newCatAssociatedEmotion) throw new BaseErrorException(`Associated Emotion Shouldn't be created`, HttpStatus.BAD_REQUEST)

        return CatAssociatedEmotionModel.hydrate(newCatAssociatedEmotion);
    }

    async findById(id: string): Promise<CatAssociatedEmotionModel | null> {
        const associatedEmotion = await this.catAssociatedEmotionDB.findById(id);
        if (!associatedEmotion) return null;

        return CatAssociatedEmotionModel.hydrate(associatedEmotion);
    }

    async findAll(): Promise<CatAssociatedEmotionModel[]> {
        const associatedEmotion = await this.catAssociatedEmotionDB.find();

        return associatedEmotion.map((associatedEmotion) => CatAssociatedEmotionModel.hydrate(associatedEmotion))
    }
}