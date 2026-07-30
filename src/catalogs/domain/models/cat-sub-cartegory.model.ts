import { BaseModel } from '../../../core/domain/models/base.model';
import { Identifier } from '../../../core/domain/value-objects/identifier';

export class CatSubCategoryModel extends BaseModel {
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

  static create(subCategory: any): CatSubCategoryModel {
    const newSubCategory = new CatSubCategoryModel(new Identifier(subCategory._id));
    newSubCategory._name = subCategory.name;
    // Left undefined when absent: the schema default covers inserts, and a partial
    // update must not resurrect a soft-deleted row.
    newSubCategory._isActive = subCategory.isActive;

    return newSubCategory;
  }

  static hydrate(subCategory: any): CatSubCategoryModel {
    const newSubCategory = new CatSubCategoryModel(new Identifier(subCategory._id));
    newSubCategory._name = subCategory.name;
    newSubCategory._isActive = subCategory.isActive;

    return newSubCategory;
  }
}
