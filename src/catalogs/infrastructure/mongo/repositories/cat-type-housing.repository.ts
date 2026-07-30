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
        const typeHousing = await this.catTypeHousingDB.findOne({ _id: id, isActive: true });

        if (!typeHousing) return null

        return CatTypeHousingModel.hydrate(typeHousing);
    }

    async findAll(includeInactive = false): Promise<CatTypeHousingModel[]> {
        const typeHousing = await this.catTypeHousingDB.find(includeInactive ? {} : { isActive: true });

        return typeHousing.map((typeHousing) => CatTypeHousingModel.hydrate(typeHousing));
    }

    async update(id: string, typeHousing: CatTypeHousingModel): Promise<CatTypeHousingModel> {
        // Undefined fields are dropped so a partial body only touches what it sends.
        const updateObject = Object.fromEntries(
            Object.entries(typeHousing.toJSON()).filter(([key, value]) => value !== undefined && key !== '_id')
        );

        const typeHousingToUpdate = await this.catTypeHousingDB.findByIdAndUpdate(id, updateObject, { new: true });

        if (!typeHousingToUpdate) throw new BaseErrorException(`Type Housing not found`, HttpStatus.NOT_FOUND)

        return CatTypeHousingModel.hydrate(typeHousingToUpdate);
    }

    async softDelete(id: string): Promise<CatTypeHousingModel> {
        const typeHousing = await this.catTypeHousingDB.findByIdAndUpdate(id, { isActive: false }, { new: true });

        if (!typeHousing) throw new BaseErrorException(`Type Housing not found`, HttpStatus.NOT_FOUND)

        return CatTypeHousingModel.hydrate(typeHousing);
    }
}
