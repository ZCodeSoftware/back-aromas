import { BaseModel } from '../../../core/domain/models/base.model';
import { Identifier } from '../../../core/domain/value-objects/identifier';

export class CatSubCategoryModel extends BaseModel {
  private _name: string;

  public toJSON() {
    const aggregate = this._id ? { _id: this._id.toValue() } : {};
    return {
      ...aggregate,
      name: this._name,
    };
  }

  static create(subCategory: any): CatSubCategoryModel {
    const newSubCategory = new CatSubCategoryModel(new Identifier(subCategory._id));
    newSubCategory._name = subCategory.name;

    return newSubCategory;
  }

  static hydrate(subCategory: any): CatSubCategoryModel {
    const newSubCategory = new CatSubCategoryModel(new Identifier(subCategory._id));
    newSubCategory._name = subCategory.name;

    return newSubCategory;
  }
}
