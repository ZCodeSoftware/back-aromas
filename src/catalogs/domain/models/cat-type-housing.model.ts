import { BaseModel } from "../../../core/domain/models/base.model";
import { Identifier } from "../../../core/domain/value-objects/identifier";

export class CatTypeHousingModel extends BaseModel {
    private _name: string;

    public toJSON() {
        const aggregate = this._id ? { _id: this._id.toValue() } : {};
        return {
            ...aggregate,
            name: this._name,
        };
    }

    static create(typeHousing: any): CatTypeHousingModel {
        const newTypeHousing = new CatTypeHousingModel(new Identifier(typeHousing._id));
        newTypeHousing._name = typeHousing.name;

        return newTypeHousing;
    }

    static hydrate(typeHousing: any): CatTypeHousingModel {
        const newTypeHousing = new CatTypeHousingModel(new Identifier(typeHousing._id));
        newTypeHousing._name = typeHousing.name;

        return newTypeHousing
    }


}