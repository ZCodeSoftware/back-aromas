import { HttpStatus, Injectable } from "@nestjs/common";
import { ICatTypeHousingRepository } from "../../../domain/repositories/cat-type-housing.repository";
import { InjectModel } from "@nestjs/mongoose";
import { Model } from "mongoose";
import { CatTypeHousingSchema } from "../schemas/cat-type-housing.schema";
import { CatTypeHousingModel } from "../../../domain/models/cat-type-housing.model";
import { BaseErrorException } from "../../../../core/domain/exceptions/base.error.exception";


@Injectable()
export class CatTypeHousingRepository implements ICatTypeHousingRepository {
    constructor(
        @InjectModel('CatTypeHousing') private readonly catTypeHousingDB: Model<CatTypeHousingSchema>
    ) { }

    async create(typeHousing: CatTypeHousingModel): Promise<CatTypeHousingModel> {
        const schema = new this.catTypeHousingDB(typeHousing.toJSON());
        const newTypeHousing = await schema.save();

        if (!newTypeHousing) throw new BaseErrorException(`Type Housing shouldn't be created`, HttpStatus.BAD_REQUEST)

        return CatTypeHousingModel.hydrate(newTypeHousing);
    }

    async findById(id: string) {
        const typeHousing = await this.catTypeHousingDB.findById(id);

        if (!typeHousing) return null

        return CatTypeHousingModel.hydrate(typeHousing);
    }

    async findAll(): Promise<CatTypeHousingModel[]> {
        const typeHousing = await this.catTypeHousingDB.find();

        return typeHousing.map((typeHousing) => CatTypeHousingModel.hydrate(typeHousing));
    }
}