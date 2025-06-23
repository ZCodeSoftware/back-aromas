import { BaseModel } from "../../../core/domain/models/base.model";
import { Identifier } from "../../../core/domain/value-objects/identifier";
import { CatSubCategoryModel } from "./cat-sub-cartegory.model";


export class CatCategoryModel extends BaseModel {
    private _name: string;
    private _subCategories: CatSubCategoryModel[];

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
            subCategories: this._subCategories ? this._subCategories.map((s) => {
                return s.toJSON();
            }) : [],
        };
    }

    static create(category: any): CatCategoryModel {
        const newCategory = new CatCategoryModel(new Identifier(category._id));
        newCategory._name = category.name;

        return newCategory;
    }


    static hydrate(category: any): CatCategoryModel {
        const newCategory = new CatCategoryModel(new Identifier(category._id));
        newCategory._name = category.name;
        newCategory._subCategories = category.subCategories?.map((s: CatSubCategoryModel) => {
            return CatCategoryModel.hydrate(s)
        })
        return newCategory
    }
}