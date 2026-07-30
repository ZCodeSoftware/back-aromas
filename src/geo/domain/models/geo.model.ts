import { BaseModel } from '../../../core/domain/models/base.model';
import { Identifier } from '../../../core/domain/value-objects/identifier';

export class GeoModel extends BaseModel {
  private _lat: string;
  private _lng: string;
  private _isActive: boolean;

  get isActive(): boolean {
    return this._isActive;
  }

  setIsActive(isActive: boolean): void {
    this._isActive = isActive;
  }

  public toJSON() {
    const aggregate = this._id ? { _id: this._id.toValue() } : {};
    return {
      ...aggregate,
      lat: this._lat,
      lng: this._lng,
      isActive: this._isActive,
    };
  }

  static create(geo: any): GeoModel {
    const newGeo = new GeoModel(new Identifier(geo._id));
    newGeo._lat = geo.lat;
    newGeo._lng = geo.lng;
    // Left undefined when absent: the schema default covers inserts, and a partial
    // update must not resurrect a soft-deleted row.
    newGeo._isActive = geo.isActive;

    return newGeo;
  }

  static hydrate(geo: any): GeoModel {
    const newGeo = new GeoModel(new Identifier(geo._id));
    newGeo._lat = geo.lat;
    newGeo._lng = geo.lng;
    newGeo._isActive = geo.isActive;
    if (geo.createdAt) {
      newGeo._createdAt = geo.createdAt;
    }
    if (geo.updatedAt) {
      newGeo._updatedAt = geo.updatedAt;
    }
    return newGeo;
  }
}
