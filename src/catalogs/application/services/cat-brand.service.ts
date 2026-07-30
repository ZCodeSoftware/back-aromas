import { HttpStatus, Inject, Injectable } from "@nestjs/common";
import { ICatBrandService } from "../../domain/services/cat-brand.service";
import SymbolsCatalogs from "../../symbols-catalogs";
import { ICatBrandRepository } from "../../domain/repositories/cat-brand.repository";
import { ICreateBrand, IUpdateBrand } from "../../domain/types/cat-brand.type";
import { CatBrandModel } from "../../domain/models/cat-brand.model";
import { BaseErrorException } from "../../../core/domain/exceptions/base.error.exception";



@Injectable()
export class CatBrandService implements ICatBrandService {
    constructor(
        @Inject(
            SymbolsCatalogs.ICatBrandRepository
        ) private readonly catBrandRepository: ICatBrandRepository
    ) { }

    async create(brand: ICreateBrand): Promise<CatBrandModel> {
        const catBrandModel = CatBrandModel.create(brand)
        return await this.catBrandRepository.create(catBrandModel);
    }

    async findAll(includeInactive = false): Promise<CatBrandModel[]> {
        return await this.catBrandRepository.findAll(includeInactive)
    }

    async findById(id: string): Promise<CatBrandModel> {
        const brand = await this.catBrandRepository.findById(id)

        if (!brand) {
            throw new BaseErrorException("Brand not found", HttpStatus.BAD_REQUEST)
        }

        return brand
    }

    async update(id: string, brand: IUpdateBrand): Promise<CatBrandModel> {
        const catBrandModel = CatBrandModel.create(brand)
        return await this.catBrandRepository.update(id, catBrandModel)
    }

    async delete(id: string): Promise<CatBrandModel> {
        return await this.catBrandRepository.softDelete(id)
    }
}