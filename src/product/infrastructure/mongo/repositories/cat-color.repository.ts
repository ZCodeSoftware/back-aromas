import { Injectable } from "@nestjs/common";
import { InjectModel } from "@nestjs/mongoose";
import { Model } from "mongoose";
import { CatColorModel } from "../../../domain/models/cat-color.model";
import { ICatColorRepository } from "../../../domain/repositories/cat-color.interface.repository";
import { CatColorSchema } from "../schemas/cat-color.schema";

@Injectable()
export class CatColorRepository implements ICatColorRepository {
    constructor(
        @InjectModel('CatColor') private readonly catColorDB: Model<CatColorSchema>
    ) { }
    async findById(id: string): Promise<CatColorModel | null> {
        const color = await this.catColorDB.findById(id);
        if (!color) return null;

        return CatColorModel.hydrate(color);
    }
}