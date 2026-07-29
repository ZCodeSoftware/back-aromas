import { HttpStatus } from '@nestjs/common';
import { BaseErrorException } from '../../../core/domain/exceptions/base.error.exception';
import { BaseModel } from '../../../core/domain/models/base.model';
import { round2 } from '../../../core/domain/utils/money.util';
import { Identifier } from '../../../core/domain/value-objects/identifier';
import { OrderChannel } from '../enum/order-channel.enum';
import { ALLOWED_TRANSITIONS, OrderStatus } from '../enum/order-status.enum';
import { ShippingType } from '../enum/shipping-type.enum';
import { IOrderStatusRef } from '../types/order.type';
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
  /** Row of `cat_order_status`: populated on every read, a bare id right after a write. */
  private _status: any;
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

  /** Code of the catalogue row, which is what every business rule is written on. */
  get status(): OrderStatus {
    return this._status?.code ?? this._status;
  }

  get statusId(): string | null {
    if (!this._status) return null;

    return String(this._status?._id ?? this._status);
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

  /**
   * Applies a status move, rejecting anything outside ALLOWED_TRANSITIONS. Takes
   * the catalogue row, not a bare code, because the document stores its id.
   */
  changeStatus(next: IOrderStatusRef): void {
    const current = this.status;
    const allowed = ALLOWED_TRANSITIONS[current] ?? [];

    if (!allowed.includes(next?.code)) {
      throw new BaseErrorException(
        `Cannot move an order from ${current} to ${next?.code}`,
        HttpStatus.BAD_REQUEST,
      );
    }

    this._status = { _id: next._id, code: next.code, name: next.name };
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
    newOrder._status = OrderModel.statusOf(order.status, OrderStatus.PENDING);
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
   * stays a readable invariant, now enforced by statusOf() since the starting
   * status has to be handed in from the catalogue.
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
    newOrder._status = OrderModel.statusOf(sale.status, OrderStatus.PAID);
    newOrder._stockRestored = false;
    newOrder.recalculateTotals();

    return newOrder;
  }

  /**
   * A factory promises the status the order is born on, so the caller has to hand
   * in that exact catalogue row. Anything else is a wiring mistake, not a request
   * error: the caller reads the row, it never comes from the outside world.
   */
  private static statusOf(status: any, expected: OrderStatus): IOrderStatusRef {
    if (!status?._id || status?.code !== expected) {
      throw new BaseErrorException(
        `An order of this kind must start on the ${expected} status of the catalogue`,
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }

    return { _id: status._id, code: status.code, name: status.name };
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
