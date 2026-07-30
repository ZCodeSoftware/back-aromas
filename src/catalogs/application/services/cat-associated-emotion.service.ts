import { HttpStatus, Inject, Injectable } from "@nestjs/common";
import { ICatAssociatedEmotionService } from "../../domain/services/cat-associated-emotion.service";
import SymbolsCatalogs from "../../symbols-catalogs";
import { ICatAssociatedEmotionRepository } from "../../domain/repositories/cat-associated-emotion.repository";
import { CatAssociatedEmotionModel } from "../../domain/models/cat-associated-emotion.model";
import { ICreateAssociatedEmotion, IUpdateAssociatedEmotion } from "../../domain/types/cat-associated-emotion.type";
import { BaseErrorException } from "../../../core/domain/exceptions/base.error.exception";



@Injectable()
export class CatAssociatedEmotionService implements ICatAssociatedEmotionService{
    constructor(
        @Inject(
            SymbolsCatalogs.ICatAssociatedEmotionRepository
        ) private readonly catAssociatedEmotionRepository: ICatAssociatedEmotionRepository
    ) { }

    async create(associatedEmotion: ICreateAssociatedEmotion): Promise<CatAssociatedEmotionModel> {
        const catAssociatedEmotionModel = CatAssociatedEmotionModel.create(associatedEmotion)
        return await this.catAssociatedEmotionRepository.create(catAssociatedEmotionModel);
    }

    async findAll(includeInactive = false): Promise<CatAssociatedEmotionModel[]> {
        return await this.catAssociatedEmotionRepository.findAll(includeInactive)
    }

    async findById(id: string): Promise<CatAssociatedEmotionModel> {
        const associatedEmotion = await this.catAssociatedEmotionRepository.findById(id)

        if(!associatedEmotion){
            throw new BaseErrorException("Associated Emotion not found", HttpStatus.BAD_REQUEST)
        }

        return associatedEmotion
    }

    async update(id: string, associatedEmotion: IUpdateAssociatedEmotion): Promise<CatAssociatedEmotionModel> {
        const catAssociatedEmotionModel = CatAssociatedEmotionModel.create(associatedEmotion)
        return await this.catAssociatedEmotionRepository.update(id, catAssociatedEmotionModel)
    }

    async delete(id: string): Promise<CatAssociatedEmotionModel> {
        return await this.catAssociatedEmotionRepository.softDelete(id)
    }

}