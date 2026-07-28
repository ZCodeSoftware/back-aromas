import { BaseModel } from "../../../core/domain/models/base.model";
import { Identifier } from "../../../core/domain/value-objects/identifier";



export class CatBrandModel extends BaseModel {
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

    static create(brand: any): CatBrandModel {
        const newBrand = new CatBrandModel(new Identifier(brand._id));
        newBrand._name = brand.name;
        // Left undefined when absent: the schema default covers inserts, and a partial
        // update must not resurrect a soft-deleted row.
        newBrand._isActive = brand.isActive;

        return newBrand;
    }

    static hydrate(brand: any): CatBrandModel {
        const newBrand = new CatBrandModel(new Identifier(brand._id));
        newBrand._name = brand.name;
        newBrand._isActive = brand.isActive;

        return newBrand
    }
}
