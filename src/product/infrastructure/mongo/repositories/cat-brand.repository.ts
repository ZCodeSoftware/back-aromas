import { Injectable } from "@nestjs/common";
import { InjectModel } from "@nestjs/mongoose";
import { Model } from "mongoose";
import { CatBrandModel } from "../../../domain/models/cat-brand.model";
import { ICatBrandRepository } from "../../../domain/repositories/cat-brand.repository";
import { CatBrandSchema } from "../schemas/cat-brand.schema";



@Injectable()
export class CatBrandRepository implements ICatBrandRepository {
    constructor(
        @InjectModel('CatBrand') private readonly catBrandDB: Model<CatBrandSchema>
    ) { }
    async findById(id: string): Promise<CatBrandModel | null> {
        const brand = await this.catBrandDB.findById(id);
        if (!brand) return null;
        return CatBrandModel.hydrate(brand);
    }
}