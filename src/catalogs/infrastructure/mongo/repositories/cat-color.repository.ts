import { HttpStatus, Injectable } from "@nestjs/common";
import { InjectModel } from "@nestjs/mongoose";
import { CatColorSchema } from "../schemas/cat-color.schema";
import { CatColorModel } from "../../../domain/models/cat-color.model";
import { BaseErrorException } from "../../../../core/domain/exceptions/base.error.exception";
import { ICatColorRepository } from "../../../domain/repositories/cat-color.interface.repository";
import { Model } from "mongoose";

@Injectable()
export class CatColorRepository implements ICatColorRepository {
    constructor(
        @InjectModel('CatColor') private readonly catColorDB: Model<CatColorSchema>
    ) { }

    async create(catColor: CatColorModel): Promise<CatColorModel> {
        const schema = new this.catColorDB(catColor.toJSON());
        const newCatColor = await schema.save();

        if (!newCatColor) throw new BaseErrorException(`Color shouldn't be created`, HttpStatus.BAD_REQUEST);
        
        return CatColorModel.hydrate(newCatColor);
    }

    async findById(id: string): Promise<CatColorModel | null>{
        const color = await this.catColorDB.findById(id);
        if(!color) return null;

        return CatColorModel.hydrate(color);
    }

    async findAll(): Promise<CatColorModel[]>{
        const colors = await this.catColorDB.find();

        return colors.map((color)=>CatColorModel.hydrate(color))
    }
}