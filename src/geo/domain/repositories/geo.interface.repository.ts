import { GeoModel } from "../models/geo.model";

export interface IGeoRepository {
    create(geo: GeoModel): Promise<GeoModel>;
    findById(id: string): Promise<GeoModel>;
    findAll(): Promise<GeoModel[]>;
}
