import { HttpStatus, Inject, Injectable } from "@nestjs/common";
import { ICatColorService } from "../../domain/services/cat-color.interface.service";
import SymbolsCatalogs from "../../symbols-catalogs";
import { ICatColorRepository } from "../../domain/repositories/cat-color.interface.repository";
import { CatColorModel } from "../../domain/models/cat-color.model";
import { ICreateColor, IUpdateColor } from "../../domain/types/cat-color.type";
import { BaseErrorException } from "../../../core/domain/exceptions/base.error.exception";

@Injectable()
export class CatColorService implements ICatColorService {
    constructor(
        @Inject(
            SymbolsCatalogs.ICatColorRepository
        )
        private readonly catColorRepository: ICatColorRepository
    ) { }

    async create(color: ICreateColor): Promise<CatColorModel> {
        const catColorModel = CatColorModel.create(color);
        return await this.catColorRepository.create(catColorModel);
    }

    async findAll(includeInactive = false): Promise<CatColorModel[]> {
        return await this.catColorRepository.findAll(includeInactive);
    }

    async findById(id: string): Promise<CatColorModel> {
        const color = await this.catColorRepository.findById(id)

        if (!color) {
            throw new BaseErrorException("Color not found", HttpStatus.BAD_REQUEST)
        }

        return color
    }

    async update(id: string, color: IUpdateColor): Promise<CatColorModel> {
        const catColorModel = CatColorModel.create(color);
        return await this.catColorRepository.update(id, catColorModel);
    }

    async delete(id: string): Promise<CatColorModel> {
        return await this.catColorRepository.softDelete(id);
    }

}