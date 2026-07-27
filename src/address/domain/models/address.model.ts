import { BaseModel } from '../../../core/domain/models/base.model';
import { Identifier } from '../../../core/domain/value-objects/identifier';
import { CatTypeHousingModel } from './cat-type-housing.model';
import { GeoModel } from './geo.model';

export class AddressModel extends BaseModel {
  private _name?: string;
  private _street: string;
  private _number?: number;
  private _zipCode: string;
  private _description?: string;
  private _floorAddress?: string;
  private _isActive: boolean;
  private _isAble: boolean;
  private _typeOfHousing?: CatTypeHousingModel;
  private _geo?: GeoModel;

  public toJSON() {
    const aggregate = this._id ? { _id: this._id.toValue() } : {};
    return {
      ...aggregate,
      name: this._name,
      street: this._street,
      number: this._number,
      zipCode: this._zipCode,
      description: this._description,
      floorAddress: this._floorAddress,
      isActive: this._isActive,
      isAble: this._isAble,
      typeOfHousing: this._typeOfHousing ? this._typeOfHousing.toJSON() : null,
      geo: this._geo ? this._geo.toJSON() : null,
    };
  }

  static create(address: any): AddressModel {
    const newAddress = new AddressModel(new Identifier(address._id));
    newAddress._name = address.name;
    newAddress._street = address.street;
    newAddress._number = address.number;
    newAddress._zipCode = address.zipCode;
    newAddress._description = address.description;
    newAddress._floorAddress = address.floorAddress;
    newAddress._isActive = address.isActive;
    newAddress._isAble = address.isAble !== undefined ? address.isAble : true;

    return newAddress;
  }

  addTypeOfHousing(typeOfHousing: CatTypeHousingModel): void {
    this._typeOfHousing = typeOfHousing;
  }

  addGeo(geo: GeoModel): void {
    this._geo = geo;
  }

  static hydrate(address: any): AddressModel {
    const newAddress = new AddressModel(new Identifier(address._id));
    newAddress._name = address.name;
    newAddress._street = address.street;
    newAddress._number = address.number;
    newAddress._zipCode = address.zipCode;
    newAddress._description = address.description;
    newAddress._floorAddress = address.floorAddress;
    newAddress._isActive = address.isActive;
    newAddress._isAble = address.isAble;
    if (address.typeOfHousing) {
      newAddress._typeOfHousing = CatTypeHousingModel.hydrate(address.typeOfHousing);
    }
    if (address.geo) {
      newAddress._geo = GeoModel.hydrate(address.geo);
    }
    return newAddress;
  }
}
