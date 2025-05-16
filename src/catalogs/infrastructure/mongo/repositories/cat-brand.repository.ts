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
        const brand = await this.catBrandDB.findById(id);
        if (!brand) return null;
        return CatBrandModel.hydrate(brand);
    }

    async findAll(): Promise<CatBrandModel[]> {
        const brand = await this.catBrandDB.find();
        return brand.map((brand) => CatBrandModel.hydrate(brand));
    }
}