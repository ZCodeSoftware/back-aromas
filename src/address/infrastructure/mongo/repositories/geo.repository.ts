import { HttpStatus, Injectable } from "@nestjs/common";
import { InjectModel } from "@nestjs/mongoose";
import { Model } from "mongoose";
import { BaseErrorException } from "../../../../core/domain/exceptions/base.error.exception";
import { GeoModel } from "../../../domain/models/geo.model";
import { IGeoRepository } from "../../../domain/repositories/geo.interface.repository";
import { GeoSchema } from "../schemas/geo.schema";

@Injectable()
export class GeoRepository implements IGeoRepository {
    constructor(
        @InjectModel('Geo') private readonly geoDB: Model<GeoSchema>
    ) { }

    async create(geo: GeoModel): Promise<GeoModel> {
        const schema = new this.geoDB(geo.toJSON());
        const newGeo = await schema.save();

        if (!newGeo) throw new BaseErrorException(`Geo shouldn't be created`, HttpStatus.BAD_REQUEST);

        return GeoModel.hydrate(newGeo);
    }

    async update(id: string, geo: GeoModel): Promise<GeoModel> {
        const updateObject = geo.toJSON();
        const filteredUpdateObject = Object.fromEntries(
            Object.entries(updateObject).filter(([, value]) => value !== null && value !== undefined)
        );

        const geoToUpdate = await this.geoDB.findByIdAndUpdate(id, filteredUpdateObject, { new: true, omitUndefined: true });

        if (!geoToUpdate) throw new BaseErrorException(`Geo shouldn't be updated`, HttpStatus.BAD_REQUEST);

        return GeoModel.hydrate(geoToUpdate);
    }
}
