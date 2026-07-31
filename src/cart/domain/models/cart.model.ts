import { HttpStatus } from '@nestjs/common';
import { BaseErrorException } from '../../../core/domain/exceptions/base.error.exception';
import { BaseModel } from '../../../core/domain/models/base.model';
import { round2 } from '../../../core/domain/utils/money.util';
import { Identifier } from '../../../core/domain/value-objects/identifier';
import { CartItemType } from '../enum/cart-item-type.enum';
import { CartItemModel } from './cart-item.model';

export class CartModel extends BaseModel {
  private _user: any;
  private _items: CartItemModel[] = [];
  private _totalPrice = 0;
  private _couponCode?: string;

  get userId(): string {
    return String(this._user?._id ?? this._user);
  }

  get items(): CartItemModel[] {
    return this._items;
  }

  /**
   * Gross sum of the lines. Discounts are deliberately absent: they are computed
   * on every preview and again at checkout, so an expired promotion can never
   * leave a stale amount sitting in the cart.
   */
  get totalPrice(): number {
    return this._totalPrice;
  }

  get couponCode(): string | undefined {
    return this._couponCode;
  }

  get isEmpty(): boolean {
    return this._items.length === 0;
  }

  /** `key` is what CartItemModel.keyOf() builds: the type plus the reference id. */
  findItem(key: string): CartItemModel | undefined {
    return this._items.find((item) => item.key === key);
  }

  findProductItem(productId: string): CartItemModel | undefined {
    return this.findItem(CartItemModel.keyOf(CartItemType.PRODUCT, String(productId)));
  }

  findComboItem(comboId: string): CartItemModel | undefined {
    return this.findItem(CartItemModel.keyOf(CartItemType.COMBO, String(comboId)));
  }

  /** Adds a new line or accumulates onto the existing one for that product. */
  addItem(product: { _id: any; price: number }, quantity: number): CartItemModel {
    return this.addLine(
      { itemType: CartItemType.PRODUCT, product, unitPrice: product.price },
      CartItemModel.keyOf(CartItemType.PRODUCT, String(product._id)),
      quantity,
    );
  }

  /** Same as addItem, for a combo priced against its components. */
  addCombo(combo: { _id: any; price: number }, quantity: number): CartItemModel {
    return this.addLine(
      { itemType: CartItemType.COMBO, combo, unitPrice: combo.price },
      CartItemModel.keyOf(CartItemType.COMBO, String(combo._id)),
      quantity,
    );
  }

  /** A quantity of 0 drops the line. */
  updateItemQuantity(key: string, quantity: number): void {
    const item = this.findItem(key);

    if (!item) {
      throw new BaseErrorException('Item is not in the cart', HttpStatus.NOT_FOUND);
    }

    if (quantity === 0) {
      this.removeItem(key);
      return;
    }

    item.setQuantity(quantity);
    this.recalculateTotal();
  }

  removeItem(key: string): void {
    const item = this.findItem(key);

    if (!item) {
      throw new BaseErrorException('Item is not in the cart', HttpStatus.NOT_FOUND);
    }

    this._items = this._items.filter((i) => i.key !== key);
    this.recalculateTotal();
  }

  clear(): void {
    this._items = [];
    this._couponCode = undefined;
    this.recalculateTotal();
  }

  /** Stored so the code survives a reload; it is revalidated on every preview. */
  setCouponCode(couponCode?: string): void {
    this._couponCode = couponCode ? couponCode.trim().toUpperCase() : undefined;
  }

  recalculateTotal(): void {
    this._totalPrice = round2(this._items.reduce((acc, item) => acc + item.total, 0));
  }

  public toJSON() {
    const aggregate = this._id ? { _id: this._id.toValue() } : {};
    return {
      ...aggregate,
      user: this._user,
      items: this._items.map((item) => item.toJSON()),
      totalPrice: this._totalPrice,
      couponCode: this._couponCode ?? null,
      createdAt: this._createdAt,
      updatedAt: this._updatedAt,
    };
  }

  static create(cart: any): CartModel {
    const newCart = new CartModel(new Identifier(cart._id));
    newCart._user = cart.user;
    newCart._items = [];
    newCart._totalPrice = 0;

    return newCart;
  }

  static hydrate(cart: any): CartModel {
    const newCart = new CartModel(new Identifier(cart._id));
    newCart._user = cart.user;
    newCart._items = cart.items ? cart.items.map((item: any) => CartItemModel.hydrate(item)) : [];
    newCart._totalPrice = cart.totalPrice ?? 0;
    newCart._couponCode = cart.couponCode ?? undefined;
    newCart._createdAt = cart.createdAt;
    newCart._updatedAt = cart.updatedAt;

    return newCart;
  }

  private addLine(
    line: { itemType: CartItemType; product?: any; combo?: any; unitPrice: number },
    key: string,
    quantity: number,
  ): CartItemModel {
    const existing = this.findItem(key);

    if (existing) {
      // The catalogue price wins over the older snapshot.
      existing.setUnitPrice(line.unitPrice);
      existing.setQuantity(existing.quantity + quantity);
      this.recalculateTotal();
      return existing;
    }

    const item = CartItemModel.create({ ...line, quantity });
    this._items.push(item);
    this.recalculateTotal();

    return item;
  }
}
