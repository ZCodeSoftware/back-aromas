import { HttpStatus, Inject, Injectable } from "@nestjs/common";
import { ICatEssenceService } from "../../domain/services/cat-essence.service";
import SymbolsCatalogs from "../../symbols-catalogs";
import { ICatEssenceRepository } from "../../domain/repositories/cat-essence.repository";
import { CatEssenceModel } from "../../domain/models/cat-essence.model";
import { ICreateEssence } from "../../domain/types/cat-essence.type";
import { BaseErrorException } from "../../../core/domain/exceptions/base.error.exception";


@Injectable()
export class CatEssenceService implements ICatEssenceService {
    constructor(
        @Inject(
            SymbolsCatalogs.ICatEssenceRepository
        ) private readonly catEssenceRepository: ICatEssenceRepository
    ) { }

    async create(essence: ICreateEssence): Promise<CatEssenceModel> {
        const newEssence = CatEssenceModel.create(essence)
        return await this.catEssenceRepository.create(newEssence);
    }

    async findAll(): Promise<CatEssenceModel[]> {
        return await this.catEssenceRepository.findAll()
    }

    async findById(id: string): Promise<CatEssenceModel | null> {
        const essence = await this.catEssenceRepository.findById(id)
        if (!essence) throw new BaseErrorException("Essence not found", HttpStatus.BAD_REQUEST)
        return essence
    }
}