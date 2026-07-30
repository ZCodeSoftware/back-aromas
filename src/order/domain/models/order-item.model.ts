import { round2 } from '../../../core/domain/utils/money.util';

/** Immutable snapshot of a purchased line. */
export class OrderItemModel {
  private _product: any;
  private _name: string;
  private _unitPrice: number;
  private _quantity: number;
  private _total: number;

  private static plain(value: any): any {
    if (value === null || value === undefined) return value;
    return typeof value.toJSON === 'function' ? value.toJSON() : value;
  }

  get productId(): string {
    return String(this._product?._id ?? this._product);
  }

  get quantity(): number {
    return this._quantity;
  }

  get total(): number {
    return this._total;
  }

  public toJSON() {
    return {
      product: this._product,
      name: this._name,
      unitPrice: this._unitPrice,
      quantity: this._quantity,
      total: this._total,
    };
  }

  static create(item: { product: any; name: string; unitPrice: number; quantity: number }): OrderItemModel {
    const newItem = new OrderItemModel();
    newItem._product = OrderItemModel.plain(item.product);
    newItem._name = item.name;
    newItem._unitPrice = item.unitPrice;
    newItem._quantity = item.quantity;
    newItem._total = round2(item.unitPrice * item.quantity);

    return newItem;
  }

  static hydrate(item: any): OrderItemModel {
    const newItem = new OrderItemModel();
    newItem._product = OrderItemModel.plain(item.product);
    newItem._name = item.name;
    newItem._unitPrice = item.unitPrice;
    newItem._quantity = item.quantity;
    newItem._total = item.total;

    return newItem;
  }
}
