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
        const essence = await this.catEssenceDB.findById(id);
        if (!essence) return null;

        return CatEssenceModel.hydrate(essence);
    }

    async findAll(): Promise<CatEssenceModel[]> {
        const essence = await this.catEssenceDB.find();
        return essence.map((essence) => CatEssenceModel.hydrate(essence))
    }
}