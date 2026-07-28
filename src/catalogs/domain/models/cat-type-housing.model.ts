import { BaseModel } from "../../../core/domain/models/base.model";
import { Identifier } from "../../../core/domain/value-objects/identifier";

export class CatTypeHousingModel extends BaseModel {
    private _name: string;
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
            name: this._name,
            isActive: this._isActive,
        };
    }

    static create(typeHousing: any): CatTypeHousingModel {
        const newTypeHousing = new CatTypeHousingModel(new Identifier(typeHousing._id));
        newTypeHousing._name = typeHousing.name;
        // Left undefined when absent: the schema default covers inserts, and a partial
        // update must not resurrect a soft-deleted row.
        newTypeHousing._isActive = typeHousing.isActive;

        return newTypeHousing;
    }

    static hydrate(typeHousing: any): CatTypeHousingModel {
        const newTypeHousing = new CatTypeHousingModel(new Identifier(typeHousing._id));
        newTypeHousing._name = typeHousing.name;
        newTypeHousing._isActive = typeHousing.isActive;

        return newTypeHousing
    }


}
