import { BaseModel } from "../../../core/domain/models/base.model";
import { Identifier } from "../../../core/domain/value-objects/identifier";



export class CatBrandModel extends BaseModel {
    private _name: string;

    public toJSON() {
        const aggregate = this._id ? { _id: this._id.toValue() } : {};
        return {
            ...aggregate,
            name: this._name,
        };
    }

    static create(brand: any): CatBrandModel {
        const newBrand = new CatBrandModel(new Identifier(brand._id));
        newBrand._name = brand.name;

        return newBrand;
    }

    static hydrate(brand: any): CatBrandModel {
        const newBrand = new CatBrandModel(new Identifier(brand._id));
        newBrand._name = brand.name;

        return newBrand
    }
}