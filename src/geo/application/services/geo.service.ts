import { Inject, Injectable } from "@nestjs/common";
import { GeoModel } from "../../domain/models/geo.model";
import { IGeoRepository } from "../../domain/repositories/geo.interface.repository";
import { IGeoService } from "../../domain/services/geo.interface.service";
import { ICreateGeo, IUpdateGeo } from "../../domain/types/geo.type";
import SymbolsGeo from "../../symbols-geo";

@Injectable()
export class GeoService implements IGeoService {
    constructor(
        @Inject(SymbolsGeo.IGeoRepository)
        private readonly geoRepository: IGeoRepository
    ) { }

    async create(geo: ICreateGeo): Promise<GeoModel> {
        const geoModel = GeoModel.create(geo);
        return this.geoRepository.create(geoModel);
    }

    async findById(id: string): Promise<GeoModel> {
        return this.geoRepository.findById(id);
    }

    async findAll(): Promise<GeoModel[]> {
        return this.geoRepository.findAll();
    }

    async update(id: string, geo: IUpdateGeo): Promise<GeoModel> {
        const geoModel = GeoModel.create(geo);
        return this.geoRepository.update(id, geoModel);
    }

    async delete(id: string): Promise<GeoModel> {
        return this.geoRepository.softDelete(id);
    }
}
