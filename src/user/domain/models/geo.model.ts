import { BaseModel } from '../../../core/domain/models/base.model';
import { Identifier } from '../../../core/domain/value-objects/identifier';

export class GeoModel extends BaseModel {
  private _lat: string;
  private _lng: string;

  public toJSON() {
    const aggregate = this._id ? { _id: this._id.toValue() } : {};
    return {
      ...aggregate,
      lat: this._lat,
      lng: this._lng,
    };
  }

  static create(geo: any): GeoModel {
    const newGeo = new GeoModel(new Identifier(geo._id));
    newGeo._lat = geo.lat;
    newGeo._lng = geo.lng;

    return newGeo;
  }

  static hydrate(geo: any): GeoModel {
    const newGeo = new GeoModel(new Identifier(geo._id));
    newGeo._lat = geo.lat;
    newGeo._lng = geo.lng;
    if (geo.createdAt) {
      newGeo._createdAt = geo.createdAt;
    }
    if (geo.updatedAt) {
      newGeo._updatedAt = geo.updatedAt;
    }
    return newGeo;
  }
}
