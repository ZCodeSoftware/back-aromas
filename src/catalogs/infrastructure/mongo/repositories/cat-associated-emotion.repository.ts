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
        const associatedEmotion = await this.catAssociatedEmotionDB.findOne({ _id: id, isActive: true });
        if (!associatedEmotion) return null;

        return CatAssociatedEmotionModel.hydrate(associatedEmotion);
    }

    async findAll(): Promise<CatAssociatedEmotionModel[]> {
        const associatedEmotion = await this.catAssociatedEmotionDB.find({ isActive: true });

        return associatedEmotion.map((associatedEmotion) => CatAssociatedEmotionModel.hydrate(associatedEmotion))
    }

    async update(id: string, associatedEmotion: CatAssociatedEmotionModel): Promise<CatAssociatedEmotionModel> {
        // Undefined fields are dropped so a partial body only touches what it sends.
        const updateObject = Object.fromEntries(
            Object.entries(associatedEmotion.toJSON()).filter(([key, value]) => value !== undefined && key !== '_id')
        );

        const associatedEmotionToUpdate = await this.catAssociatedEmotionDB.findByIdAndUpdate(id, updateObject, { new: true });

        if (!associatedEmotionToUpdate) throw new BaseErrorException(`Associated Emotion not found`, HttpStatus.NOT_FOUND)

        return CatAssociatedEmotionModel.hydrate(associatedEmotionToUpdate);
    }

    async softDelete(id: string): Promise<CatAssociatedEmotionModel> {
        const associatedEmotion = await this.catAssociatedEmotionDB.findByIdAndUpdate(id, { isActive: false }, { new: true });

        if (!associatedEmotion) throw new BaseErrorException(`Associated Emotion not found`, HttpStatus.NOT_FOUND)

        return CatAssociatedEmotionModel.hydrate(associatedEmotion);
    }
}
