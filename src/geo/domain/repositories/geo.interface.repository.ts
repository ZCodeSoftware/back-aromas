import { GeoModel } from "../models/geo.model";

export interface IGeoRepository {
    create(geo: GeoModel): Promise<GeoModel>;
    findById(id: string): Promise<GeoModel>;
    findAll(): Promise<GeoModel[]>;
    update(id: string, geo: GeoModel): Promise<GeoModel>;
    softDelete(id: string): Promise<GeoModel>;
}
