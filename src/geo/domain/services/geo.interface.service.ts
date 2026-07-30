import { GeoModel } from "../models/geo.model";
import { ICreateGeo, IUpdateGeo } from "../types/geo.type";

export interface IGeoService {
    create(geo: ICreateGeo): Promise<GeoModel>;
    findById(id: string): Promise<GeoModel>;
    findAll(): Promise<GeoModel[]>;
    update(id: string, geo: IUpdateGeo): Promise<GeoModel>;
    delete(id: string): Promise<GeoModel>;
}
