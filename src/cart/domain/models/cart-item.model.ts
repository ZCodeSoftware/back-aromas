import { round2 } from '../../../core/domain/utils/money.util';
import { CartItemType } from '../enum/cart-item-type.enum';

/**
 * Value object: a cart line. Identified by what it points at — a product or a
 * combo — not by an id of its own. `_product` / `_combo` hold whatever the
 * persistence layer gave us, a populated document or a bare ObjectId, always
 * flattened to a plain object.
 */
export class CartItemModel {
  private _itemType: CartItemType = CartItemType.PRODUCT;
  private _product: any;
  private _combo: any;
  private _quantity: number;
  private _unitPrice: number;
  private _total: number;

  private static plain(value: any): any {
    if (value === null || value === undefined) return value;
    return typeof value.toJSON === 'function' ? value.toJSON() : value;
  }

  /**
   * Identity of the line. The type is part of it because product and combo ids
   * come from different collections and must never be matched against each other.
   */
  static keyOf(itemType: CartItemType, referenceId: string): string {
    return `${itemType}:${referenceId}`;
  }

  get key(): string {
    return CartItemModel.keyOf(this._itemType, this.referenceId);
  }

  get itemType(): CartItemType {
    return this._itemType;
  }

  get isCombo(): boolean {
    return this._itemType === CartItemType.COMBO;
  }

  /** Id of whatever the line points at, product or combo. */
  get referenceId(): string {
    const reference = this.isCombo ? this._combo : this._product;

    return String(reference?._id ?? reference);
  }

  /** Null on a combo line, which references a combo instead. */
  get productId(): string | null {
    if (this.isCombo) return null;

    return String(this._product?._id ?? this._product);
  }

  get comboId(): string | null {
    if (!this.isCombo) return null;

    return String(this._combo?._id ?? this._combo);
  }

  get product(): any {
    return this._product;
  }

  get combo(): any {
    return this._combo;
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
      itemType: this._itemType,
      product: this._product ?? null,
      combo: this._combo ?? null,
      quantity: this._quantity,
      unitPrice: this._unitPrice,
      total: this._total,
    };
  }

  static create(item: {
    itemType?: CartItemType;
    product?: any;
    combo?: any;
    quantity: number;
    unitPrice: number;
  }): CartItemModel {
    const newItem = new CartItemModel();
    newItem._itemType = item.itemType ?? CartItemType.PRODUCT;
    newItem._product = CartItemModel.plain(item.product);
    newItem._combo = CartItemModel.plain(item.combo);
    newItem._quantity = item.quantity;
    newItem._unitPrice = item.unitPrice;
    newItem._total = round2(item.quantity * item.unitPrice);

    return newItem;
  }

  static hydrate(item: any): CartItemModel {
    const newItem = new CartItemModel();
    // Not trusting the schema default: lines written before combos existed were
    // never rewritten, so the field is simply absent on them.
    newItem._itemType = item.itemType ?? CartItemType.PRODUCT;
    newItem._product = CartItemModel.plain(item.product);
    newItem._combo = CartItemModel.plain(item.combo);
    newItem._quantity = item.quantity;
    newItem._unitPrice = item.unitPrice;
    newItem._total = item.total;

    return newItem;
  }
}
