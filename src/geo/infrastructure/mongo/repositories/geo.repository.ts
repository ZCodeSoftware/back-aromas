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

    async findById(id: string): Promise<GeoModel> {
        const geo = await this.geoDB.findOne({ _id: id, isActive: true });
        if (!geo) throw new BaseErrorException('Geo not found', HttpStatus.NOT_FOUND);
        return GeoModel.hydrate(geo);
    }

    async findAll(): Promise<GeoModel[]> {
        const geos = await this.geoDB.find({ isActive: true });
        return geos?.map(geo => GeoModel.hydrate(geo));
    }

    async update(id: string, geo: GeoModel): Promise<GeoModel> {
        // Undefined fields are dropped so a partial body only touches what it sends.
        const updateObject = Object.fromEntries(
            Object.entries(geo.toJSON()).filter(([key, value]) => value !== undefined && key !== '_id')
        );

        const geoToUpdate = await this.geoDB.findByIdAndUpdate(id, updateObject, { new: true });

        if (!geoToUpdate) throw new BaseErrorException('Geo not found', HttpStatus.NOT_FOUND);

        return GeoModel.hydrate(geoToUpdate);
    }

    async softDelete(id: string): Promise<GeoModel> {
        const geo = await this.geoDB.findByIdAndUpdate(id, { isActive: false }, { new: true });

        if (!geo) throw new BaseErrorException('Geo not found', HttpStatus.NOT_FOUND);

        return GeoModel.hydrate(geo);
    }
}
