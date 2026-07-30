import { HttpStatus, Injectable } from "@nestjs/common";
import { InjectModel } from "@nestjs/mongoose";
import { Model } from "mongoose";
import { CatBrandSchema } from "../schemas/cat-brand.schema";
import { CatBrandModel } from "../../../domain/models/cat-brand.model";
import { BaseErrorException } from "../../../../core/domain/exceptions/base.error.exception";
import { ICatBrandRepository } from "../../../domain/repositories/cat-brand.repository";



@Injectable()
export class CatBrandRepository implements ICatBrandRepository {
    constructor(
        @InjectModel('CatBrand') private readonly catBrandDB: Model<CatBrandSchema>
    ) { }

    async create(catBrand: CatBrandModel): Promise<CatBrandModel> {
        const schema = new this.catBrandDB(catBrand.toJSON());
        const newCatBrand = await schema.save();

        if (!newCatBrand) throw new BaseErrorException(`Brand Shouldn't be created`, HttpStatus.BAD_REQUEST)

        return CatBrandModel.hydrate(newCatBrand);
    }

    async findById(id: string): Promise<CatBrandModel | null> {
        const brand = await this.catBrandDB.findOne({ _id: id, isActive: true });
        if (!brand) return null;
        return CatBrandModel.hydrate(brand);
    }

    async findAll(includeInactive = false): Promise<CatBrandModel[]> {
        const brand = await this.catBrandDB.find(includeInactive ? {} : { isActive: true });
        return brand.map((brand) => CatBrandModel.hydrate(brand));
    }

    async update(id: string, brand: CatBrandModel): Promise<CatBrandModel> {
        // Undefined fields are dropped so a partial body only touches what it sends.
        const updateObject = Object.fromEntries(
            Object.entries(brand.toJSON()).filter(([key, value]) => value !== undefined && key !== '_id')
        );

        const brandToUpdate = await this.catBrandDB.findByIdAndUpdate(id, updateObject, { new: true });

        if (!brandToUpdate) throw new BaseErrorException(`Brand not found`, HttpStatus.NOT_FOUND)

        return CatBrandModel.hydrate(brandToUpdate);
    }

    async softDelete(id: string): Promise<CatBrandModel> {
        const brand = await this.catBrandDB.findByIdAndUpdate(id, { isActive: false }, { new: true });

        if (!brand) throw new BaseErrorException(`Brand not found`, HttpStatus.NOT_FOUND)

        return CatBrandModel.hydrate(brand);
    }
}
