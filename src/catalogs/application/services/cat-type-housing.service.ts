import { HttpStatus, Inject, Injectable } from "@nestjs/common";
import { ICatTypeHousingService } from "../../domain/services/cat-type-housing.service";
import SymbolsCatalogs from "../../symbols-catalogs";
import { ICatTypeHousingRepository } from "../../domain/repositories/cat-type-housing.repository";
import { CatTypeHousingModel } from "../../domain/models/cat-type-housing.model";
import { ICreateTypeHousing } from "../../domain/types/cat-type-housing.type";
import { BaseErrorException } from "../../../core/domain/exceptions/base.error.exception";

@Injectable()
export class CatTypeHousingService implements ICatTypeHousingService {
    constructor(
        @Inject(
            SymbolsCatalogs.ICatTypeHousingRepository
        ) private readonly catTypeHousingRepository: ICatTypeHousingRepository
    ) { }

    async create(typeHousing: ICreateTypeHousing): Promise<CatTypeHousingModel> {
        const catTypeHousingModel = CatTypeHousingModel.create(typeHousing)
        return await this.catTypeHousingRepository.create(catTypeHousingModel);
    }

    async findAll(): Promise<CatTypeHousingModel[]> {
        return await this.catTypeHousingRepository.findAll();
    }

    async findById(id: string): Promise<CatTypeHousingModel> {
        const typeHousing = await this.catTypeHousingRepository.findById(id)

        if (!typeHousing) throw new BaseErrorException("Type Housing by id not found", HttpStatus.BAD_REQUEST)

        return typeHousing
    }
}