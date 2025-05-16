import { HttpStatus, Inject, Injectable } from "@nestjs/common";
import { ICatBrandService } from "../../domain/services/cat-brand.service";
import SymbolsCatalogs from "../../symbols-catalogs";
import { ICatBrandRepository } from "../../domain/repositories/cat-brand.repository";
import { ICreateBrand } from "../../domain/types/cat-brand.type";
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

    async findAll(): Promise<CatBrandModel[]> {
        return await this.catBrandRepository.findAll()
    }

    async findById(id: string): Promise<CatBrandModel> {
        const brand = await this.catBrandRepository.findById(id)

        if (!brand) {
            throw new BaseErrorException("Brand not found", HttpStatus.BAD_REQUEST)
        }

        return brand
    }
}