import { HttpStatus } from '@nestjs/common';
import { BaseErrorException } from '../../../core/domain/exceptions/base.error.exception';
import { BaseModel } from '../../../core/domain/models/base.model';
import { round2 } from '../../../core/domain/utils/money.util';
import { Identifier } from '../../../core/domain/value-objects/identifier';
import { CartItemModel } from './cart-item.model';

export class CartModel extends BaseModel {
  private _user: any;
  private _items: CartItemModel[] = [];
  private _totalPrice = 0;

  get userId(): string {
    return String(this._user?._id ?? this._user);
  }

  get items(): CartItemModel[] {
    return this._items;
  }

  get totalPrice(): number {
    return this._totalPrice;
  }

  get isEmpty(): boolean {
    return this._items.length === 0;
  }

  findItem(productId: string): CartItemModel | undefined {
    return this._items.find((item) => item.productId === String(productId));
  }

  /** Adds a new line or accumulates onto the existing one for that product. */
  addItem(product: { _id: any; price: number }, quantity: number): CartItemModel {
    const existing = this.findItem(String(product._id));

    if (existing) {
      // The catalogue price wins over the older snapshot.
      existing.setUnitPrice(product.price);
      existing.setQuantity(existing.quantity + quantity);
      this.recalculateTotal();
      return existing;
    }

    const item = CartItemModel.create({ product, quantity, unitPrice: product.price });
    this._items.push(item);
    this.recalculateTotal();

    return item;
  }

  /** A quantity of 0 drops the line. */
  updateItemQuantity(productId: string, quantity: number): void {
    const item = this.findItem(productId);

    if (!item) {
      throw new BaseErrorException('Product is not in the cart', HttpStatus.NOT_FOUND);
    }

    if (quantity === 0) {
      this.removeItem(productId);
      return;
    }

    item.setQuantity(quantity);
    this.recalculateTotal();
  }

  removeItem(productId: string): void {
    const item = this.findItem(productId);

    if (!item) {
      throw new BaseErrorException('Product is not in the cart', HttpStatus.NOT_FOUND);
    }

    this._items = this._items.filter((i) => i.productId !== String(productId));
    this.recalculateTotal();
  }

  clear(): void {
    this._items = [];
    this.recalculateTotal();
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
    newCart._createdAt = cart.createdAt;
    newCart._updatedAt = cart.updatedAt;

    return newCart;
  }
}
