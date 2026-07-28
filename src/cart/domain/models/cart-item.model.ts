import { round2 } from '../../../core/domain/utils/money.util';

/**
 * Value object: a cart line. Identified by its product, not by an id of its own.
 * `_product` holds whatever the persistence layer gave us — a populated product
 * document or a bare ObjectId — always flattened to a plain object.
 */
export class CartItemModel {
  private _product: any;
  private _quantity: number;
  private _unitPrice: number;
  private _total: number;

  private static plain(value: any): any {
    if (value === null || value === undefined) return value;
    return typeof value.toJSON === 'function' ? value.toJSON() : value;
  }

  get productId(): string {
    return String(this._product?._id ?? this._product);
  }

  get product(): any {
    return this._product;
  }

  get quantity(): number {
    return this._quantity;
  }

  get unitPrice(): number {
    return this._unitPrice;
  }

  get total(): number {
    return this._total;
  }

  setQuantity(quantity: number): void {
    this._quantity = quantity;
    this._total = round2(quantity * this._unitPrice);
  }

  setUnitPrice(unitPrice: number): void {
    this._unitPrice = unitPrice;
    this._total = round2(this._quantity * unitPrice);
  }

  public toJSON() {
    return {
      product: this._product,
      quantity: this._quantity,
      unitPrice: this._unitPrice,
      total: this._total,
    };
  }

  static create(item: { product: any; quantity: number; unitPrice: number }): CartItemModel {
    const newItem = new CartItemModel();
    newItem._product = CartItemModel.plain(item.product);
    newItem._quantity = item.quantity;
    newItem._unitPrice = item.unitPrice;
    newItem._total = round2(item.quantity * item.unitPrice);

    return newItem;
  }

  static hydrate(item: any): CartItemModel {
    const newItem = new CartItemModel();
    newItem._product = CartItemModel.plain(item.product);
    newItem._quantity = item.quantity;
    newItem._unitPrice = item.unitPrice;
    newItem._total = item.total;

    return newItem;
  }
}
