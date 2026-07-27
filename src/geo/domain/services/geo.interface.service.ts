import { GeoModel } from "../models/geo.model";
import { ICreateGeo } from "../types/geo.type";

export interface IGeoService {
    create(geo: ICreateGeo): Promise<GeoModel>;
    findById(id: string): Promise<GeoModel>;
    findAll(): Promise<GeoModel[]>;
}
