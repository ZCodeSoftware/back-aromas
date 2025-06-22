import { BaseModel } from '../../../core/domain/models/base.model';
import { Identifier } from '../../../core/domain/value-objects/identifier';
import { CatAssociatedEmotionModel } from './cat-associated-emotion.model';
import { CatBrandModel } from './cat-brand.model';
import { CatCategoryModel } from './cat-category.model';
import { CatColorModel } from './cat-color.model';
import { CatEssenceModel } from './cat-essence.model';
import { CatSubCategoryModel } from './cat-sub-cartegory.model';

export class ProductModel extends BaseModel {
  private _name: string;
  private _description?: string;
  private _price: number;
  private _images?: string[];
  private _stock: number;
  private _isActive: boolean;
  private _color?: CatColorModel;
  private _essence?: CatEssenceModel;
  private _associatedEmotion?: CatAssociatedEmotionModel;
  private _brand?: CatBrandModel;
  private _category: CatCategoryModel
  private _subCategory?: CatSubCategoryModel;

  addColor(color: CatColorModel): void {
    this._color = color;
  }

  addEssence(essence: CatEssenceModel): void {
    this._essence = essence;
  }

  addAssociatedEmotion(associatedEmotion: CatAssociatedEmotionModel): void {
    this._associatedEmotion = associatedEmotion;
  }

  addBrand(brand: CatBrandModel): void {
    this._brand = brand;
  }

  addCategory(category: CatCategoryModel): void {
    this._category = category;
  }

  addSubCategory(subCategory: CatSubCategoryModel): void {
    this._subCategory = subCategory;
  }

  public toJSON() {
    const aggregate = this._id ? { _id: this._id.toValue() } : {};
    return {
      ...aggregate,
      name: this._name,
      description: this._description,
      price: this._price,
      images: this._images,
      stock: this._stock,
      isActive: this._isActive,
      color: this._color ? this._color.toJSON() : null,
      essence: this._essence ? this._essence.toJSON() : null,
      associatedEmotion: this._associatedEmotion ? this._associatedEmotion.toJSON() : null,
      brand: this._brand ? this._brand.toJSON() : null,
      category: this._category.toJSON(),
      subCategory: this._subCategory ? this._subCategory.toJSON() : null,
    };
  }

  static create(product: any): ProductModel {
    const newProduct = new ProductModel(new Identifier(product._id));
    newProduct._name = product.name;
    newProduct._description = product.description;
    newProduct._price = product.price;
    newProduct._images = product.images ?? [];
    newProduct._stock = product.stock;
    newProduct._isActive = product.isActive ?? true;

    return newProduct;
  }

  static hydrate(product: any): ProductModel {
    const newProduct = new ProductModel(new Identifier(product._id));
    newProduct._name = product.name;
    newProduct._description = product.description;
    newProduct._price = product.price;
    newProduct._images = product.images || [];
    newProduct._stock = product.stock;
    newProduct._isActive = product.isActive;
    newProduct._color = product.color ? CatColorModel.hydrate(product.color) : null;
    newProduct._essence = product.essence ? CatEssenceModel.hydrate(product.essence) : null;
    newProduct._associatedEmotion = product.associatedEmotion ? CatAssociatedEmotionModel.hydrate(product.associatedEmotion) : null;
    newProduct._brand = product.brand ? CatBrandModel.hydrate(product.brand) : null;
    newProduct._category = CatCategoryModel.hydrate(product.category);
    newProduct._subCategory = product.subCategory ? CatSubCategoryModel.hydrate(product.subCategory) : null;

    return newProduct;
  }
}
