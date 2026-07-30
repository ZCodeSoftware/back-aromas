import { GeoModel } from "../models/geo.model";

export interface IGeoRepository {
    create(geo: GeoModel): Promise<GeoModel>;
    update(id: string, geo: GeoModel): Promise<GeoModel>;
}
