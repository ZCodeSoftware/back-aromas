import { Injectable } from "@nestjs/common";
import { InjectModel } from "@nestjs/mongoose";
import { Model } from "mongoose";
import { CatEssenceModel } from "../../../domain/models/cat-essence.model";
import { ICatEssenceRepository } from "../../../domain/repositories/cat-essence.repository";
import { CatEssenceSchema } from "../schemas/cat-essence.schema";



@Injectable()

export class CatEssenceRepository implements ICatEssenceRepository {
    constructor(
        @InjectModel('CatEssence') private readonly catEssenceDB: Model<CatEssenceSchema>
    ) { }
    async findById(id: string): Promise<CatEssenceModel | null> {
        const essence = await this.catEssenceDB.findById(id);
        if (!essence) return null;

        return CatEssenceModel.hydrate(essence);
    }
}