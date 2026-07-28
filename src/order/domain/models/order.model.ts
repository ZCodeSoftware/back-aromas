import { HttpStatus } from '@nestjs/common';
import { BaseErrorException } from '../../../core/domain/exceptions/base.error.exception';
import { BaseModel } from '../../../core/domain/models/base.model';
import { round2 } from '../../../core/domain/utils/money.util';
import { Identifier } from '../../../core/domain/value-objects/identifier';
import { OrderChannel } from '../enum/order-channel.enum';
import { ALLOWED_TRANSITIONS, OrderStatus } from '../enum/order-status.enum';
import { ShippingType } from '../enum/shipping-type.enum';
import { OrderItemModel } from './order-item.model';

export class OrderModel extends BaseModel {
  private _user: any;
  private _items: OrderItemModel[] = [];
  private _subTotalPrice = 0;
  private _shippingPrice = 0;
  private _totalPrice = 0;
  private _paymentMethod: any;
  private _shippingType: ShippingType;
  private _shippingAddress?: any;
  private _status: OrderStatus = OrderStatus.PENDING;
  private _stockRestored = false;
  private _channel: OrderChannel = OrderChannel.ONLINE;
  private _soldBy?: any;
  private _customer?: any;

  /** Null on a counter sale with no account behind it. */
  get userId(): string | null {
    if (!this._user) return null;

    return String(this._user?._id ?? this._user);
  }

  get items(): OrderItemModel[] {
    return this._items;
  }

  get status(): OrderStatus {
    return this._status;
  }

  get channel(): OrderChannel {
    return this._channel;
  }

  get stockRestored(): boolean {
    return this._stockRestored;
  }

  get totalPrice(): number {
    return this._totalPrice;
  }

  addItem(item: OrderItemModel): void {
    this._items.push(item);
    this.recalculateTotals();
  }

  setShippingPrice(shippingPrice: number): void {
    this._shippingPrice = round2(shippingPrice);
    this.recalculateTotals();
  }

  setShippingAddress(shippingAddress: any): void {
    this._shippingAddress = shippingAddress;
  }

  setPaymentMethod(paymentMethod: any): void {
    this._paymentMethod = typeof paymentMethod?.toJSON === 'function' ? paymentMethod.toJSON() : paymentMethod;
  }

  recalculateTotals(): void {
    this._subTotalPrice = round2(this._items.reduce((acc, item) => acc + item.total, 0));
    this._totalPrice = round2(this._subTotalPrice + this._shippingPrice);
  }

  /** Applies a status move, rejecting anything outside ALLOWED_TRANSITIONS. */
  changeStatus(next: OrderStatus): void {
    const allowed = ALLOWED_TRANSITIONS[this._status] ?? [];

    if (!allowed.includes(next)) {
      throw new BaseErrorException(
        `Cannot move an order from ${this._status} to ${next}`,
        HttpStatus.BAD_REQUEST,
      );
    }

    this._status = next;
  }

  markStockRestored(): void {
    this._stockRestored = true;
  }

  public toJSON() {
    const aggregate = this._id ? { _id: this._id.toValue() } : {};
    return {
      ...aggregate,
      user: this._user,
      items: this._items.map((item) => item.toJSON()),
      subTotalPrice: this._subTotalPrice,
      shippingPrice: this._shippingPrice,
      totalPrice: this._totalPrice,
      paymentMethod: this._paymentMethod,
      shippingType: this._shippingType,
      shippingAddress: this._shippingAddress ?? null,
      status: this._status,
      stockRestored: this._stockRestored,
      channel: this._channel,
      soldBy: this._soldBy ?? null,
      customer: this._customer ?? null,
      createdAt: this._createdAt,
      updatedAt: this._updatedAt,
    };
  }

  static create(order: any): OrderModel {
    const newOrder = new OrderModel(new Identifier(order._id));
    newOrder._user = order.user;
    newOrder._items = [];
    newOrder._shippingType = order.shippingType;
    newOrder._shippingPrice = round2(order.shippingPrice ?? 0);
    newOrder._status = OrderStatus.PENDING;
    newOrder._stockRestored = false;
    newOrder._channel = OrderChannel.ONLINE;
    newOrder.recalculateTotals();

    return newOrder;
  }

  /**
   * Counter sale. The money is already in the drawer, so it is born PAID, and
   * shipping is meaningless because the buyer walks out with the goods.
   *
   * Kept as its own factory so that "whatever `create()` returns is PENDING"
   * stays a readable invariant and no online caller can smuggle a status in.
   */
  static createPosSale(sale: any): OrderModel {
    const newOrder = new OrderModel(new Identifier(sale._id));
    newOrder._user = sale.user ?? null;
    newOrder._customer = sale.customer ?? null;
    newOrder._soldBy = sale.soldBy;
    newOrder._channel = OrderChannel.POS;
    newOrder._items = [];
    newOrder._shippingType = ShippingType.PICKUP;
    newOrder._shippingPrice = 0;
    newOrder._status = OrderStatus.PAID;
    newOrder._stockRestored = false;
    newOrder.recalculateTotals();

    return newOrder;
  }

  static hydrate(order: any): OrderModel {
    const newOrder = new OrderModel(new Identifier(order._id));
    newOrder._user = order.user;
    newOrder._items = order.items ? order.items.map((item: any) => OrderItemModel.hydrate(item)) : [];
    newOrder._subTotalPrice = order.subTotalPrice ?? 0;
    newOrder._shippingPrice = order.shippingPrice ?? 0;
    newOrder._totalPrice = order.totalPrice ?? 0;
    newOrder._paymentMethod = order.paymentMethod;
    newOrder._shippingType = order.shippingType;
    newOrder._shippingAddress = order.shippingAddress ?? null;
    newOrder._status = order.status;
    newOrder._stockRestored = order.stockRestored ?? false;
    // Documents written before the point-of-sale feature carry no channel.
    newOrder._channel = order.channel ?? OrderChannel.ONLINE;
    newOrder._soldBy = order.soldBy ?? null;
    newOrder._customer = order.customer ?? null;
    newOrder._createdAt = order.createdAt;
    newOrder._updatedAt = order.updatedAt;

    return newOrder;
  }
}
