import { BaseModel } from "../../../core/domain/models/base.model";
import { Identifier } from "../../../core/domain/value-objects/identifier";
import { CatSubCategoryModel } from "./cat-sub-cartegory.model";


export class CatCategoryModel extends BaseModel {
    private _name: string;
    private _subCategories: CatSubCategoryModel[];
    private _isActive: boolean;

    get isActive(): boolean {
        return this._isActive;
    }

    setIsActive(isActive: boolean): void {
        this._isActive = isActive;
    }

    addSubCategory(subCategory: CatSubCategoryModel) {
        if (!this._subCategories) {
            this._subCategories = []
        }

        this._subCategories.push(subCategory)
    }

    public toJSON() {
        const aggregate = this._id ? { _id: this._id.toValue() } : {};
        return {
            ...aggregate,
            name: this._name,
            // undefined rather than [] so a partial update that omits subCategories
            // is filtered out by the repository instead of wiping the relation.
            subCategories: this._subCategories ? this._subCategories.map((s) => {
                return s.toJSON();
            }) : undefined,
            isActive: this._isActive,
        };
    }

    static create(category: any): CatCategoryModel {
        const newCategory = new CatCategoryModel(new Identifier(category._id));
        newCategory._name = category.name;
        // Left undefined on purpose: the schema default covers inserts, and a partial
        // update must not resurrect a soft-deleted row.
        newCategory._isActive = category.isActive;

        return newCategory;
    }


    static hydrate(category: any): CatCategoryModel {
        const newCategory = new CatCategoryModel(new Identifier(category._id));
        newCategory._name = category.name;
        newCategory._isActive = category.isActive;
        newCategory._subCategories = category.subCategories?.map((s: any) => {
            return CatSubCategoryModel.hydrate(s)
        })
        return newCategory
    }
}
