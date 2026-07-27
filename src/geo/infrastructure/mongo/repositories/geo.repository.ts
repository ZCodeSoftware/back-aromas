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
        const geo = await this.geoDB.findById(id);
        if (!geo) throw new BaseErrorException('Geo not found', HttpStatus.NOT_FOUND);
        return GeoModel.hydrate(geo);
    }

    async findAll(): Promise<GeoModel[]> {
        const geos = await this.geoDB.find();
        return geos?.map(geo => GeoModel.hydrate(geo));
    }
}
