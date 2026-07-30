import { Injectable } from "@nestjs/common";
import { InjectModel } from "@nestjs/mongoose";
import { Model } from "mongoose";
import { CatTypeHousingModel } from "../../../domain/models/cat-type-housing.model";
import { ICatTypeHousingRepository } from "../../../domain/repositories/cat-type-housing.repository";
import { CatTypeHousingSchema } from "../schemas/cat-type-housing.schema";


@Injectable()
export class CatTypeHousingRepository implements ICatTypeHousingRepository {
    constructor(
        @InjectModel('CatTypeHousing') private readonly catTypeHousingDB: Model<CatTypeHousingSchema>
    ) { }

    async findById(id: string) {
        const typeHousing = await this.catTypeHousingDB.findById(id);

        if (!typeHousing) return null

        return CatTypeHousingModel.hydrate(typeHousing);
    }
}