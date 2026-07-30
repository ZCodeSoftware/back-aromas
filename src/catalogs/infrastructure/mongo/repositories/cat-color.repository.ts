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
        const color = await this.catColorDB.findOne({ _id: id, isActive: true });
        if(!color) return null;

        return CatColorModel.hydrate(color);
    }

    async findAll(includeInactive = false): Promise<CatColorModel[]>{
        const colors = await this.catColorDB.find(includeInactive ? {} : { isActive: true });

        return colors.map((color)=>CatColorModel.hydrate(color))
    }

    async update(id: string, color: CatColorModel): Promise<CatColorModel> {
        // Undefined fields are dropped so a partial body only touches what it sends.
        const updateObject = Object.fromEntries(
            Object.entries(color.toJSON()).filter(([key, value]) => value !== undefined && key !== '_id')
        );

        const colorToUpdate = await this.catColorDB.findByIdAndUpdate(id, updateObject, { new: true });

        if (!colorToUpdate) throw new BaseErrorException(`Color not found`, HttpStatus.NOT_FOUND);

        return CatColorModel.hydrate(colorToUpdate);
    }

    async softDelete(id: string): Promise<CatColorModel> {
        const color = await this.catColorDB.findByIdAndUpdate(id, { isActive: false }, { new: true });

        if (!color) throw new BaseErrorException(`Color not found`, HttpStatus.NOT_FOUND);

        return CatColorModel.hydrate(color);
    }
}
