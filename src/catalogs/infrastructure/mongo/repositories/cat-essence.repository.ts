import { HttpStatus, Injectable } from "@nestjs/common";
import { ICatEssenceRepository } from "../../../domain/repositories/cat-essence.repository";
import { CatEssenceSchema } from "../schemas/cat-essence.schema";
import { Model } from "mongoose";
import { InjectModel } from "@nestjs/mongoose";
import { CatEssenceModel } from "../../../domain/models/cat-essence.model";
import { BaseErrorException } from "../../../../core/domain/exceptions/base.error.exception";



@Injectable()

export class CatEssenceRepository implements ICatEssenceRepository {
    constructor(
        @InjectModel('CatEssence') private readonly catEssenceDB: Model<CatEssenceSchema>
    ) { }

    async create(essence: CatEssenceModel): Promise<CatEssenceModel> {
        const schema = new this.catEssenceDB(essence.toJSON());
        const newCatEssence = await schema.save();

        if (!newCatEssence) throw new BaseErrorException(`Essence Shouldn't be created`, HttpStatus.BAD_REQUEST)

        return CatEssenceModel.hydrate(newCatEssence);
    }

    async findById(id: string): Promise<CatEssenceModel | null> {
        const essence = await this.catEssenceDB.findOne({ _id: id, isActive: true });
        if (!essence) return null;

        return CatEssenceModel.hydrate(essence);
    }

    async findAll(includeInactive = false): Promise<CatEssenceModel[]> {
        const essence = await this.catEssenceDB.find(includeInactive ? {} : { isActive: true });
        return essence.map((essence) => CatEssenceModel.hydrate(essence))
    }

    async update(id: string, essence: CatEssenceModel): Promise<CatEssenceModel> {
        // Undefined fields are dropped so a partial body only touches what it sends.
        const updateObject = Object.fromEntries(
            Object.entries(essence.toJSON()).filter(([key, value]) => value !== undefined && key !== '_id')
        );

        const essenceToUpdate = await this.catEssenceDB.findByIdAndUpdate(id, updateObject, { new: true });

        if (!essenceToUpdate) throw new BaseErrorException(`Essence not found`, HttpStatus.NOT_FOUND)

        return CatEssenceModel.hydrate(essenceToUpdate);
    }

    async softDelete(id: string): Promise<CatEssenceModel> {
        const essence = await this.catEssenceDB.findByIdAndUpdate(id, { isActive: false }, { new: true });

        if (!essence) throw new BaseErrorException(`Essence not found`, HttpStatus.NOT_FOUND)

        return CatEssenceModel.hydrate(essence);
    }
}
