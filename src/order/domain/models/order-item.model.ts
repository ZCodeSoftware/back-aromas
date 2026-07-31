import { round2 } from '../../../core/domain/utils/money.util';
import { OrderItemType } from '../enum/order-item-type.enum';
import { IOrderItemComponent, IStockLine } from '../types/order.type';

/**
 * Immutable snapshot of a purchased line. A line is either a product or a combo,
 * told apart by `_itemType`; a combo also snapshots what it was made of, so the
 * ticket stays readable and stock can be given back even if the combo is later
 * edited or deleted.
 */
export class OrderItemModel {
  private _itemType: OrderItemType = OrderItemType.PRODUCT;
  private _product: any;
  private _combo: any;
  private _components: IOrderItemComponent[] = [];
  private _name: string;
  private _unitPrice: number;
  private _quantity: number;
  private _total: number;
  private _discount = 0;
  private _netTotal: number;
  private _appliedPromotions: any[] = [];

  private static plain(value: any): any {
    if (value === null || value === undefined) return value;
    return typeof value.toJSON === 'function' ? value.toJSON() : value;
  }

  get itemType(): OrderItemType {
    return this._itemType;
  }

  get isCombo(): boolean {
    return this._itemType === OrderItemType.COMBO;
  }

  /** Null on a combo line, which references a combo instead. */
  get productId(): string | null {
    if (this.isCombo) return null;

    return String(this._product?._id ?? this._product);
  }

  get comboId(): string | null {
    if (!this._combo) return null;

    return String(this._combo?._id ?? this._combo);
  }

  get quantity(): number {
    return this._quantity;
  }

  /** Gross line amount, before any discount. */
  get total(): number {
    return this._total;
  }

  get discount(): number {
    return this._discount;
  }

  get netTotal(): number {
    return this._netTotal;
  }

  /**
   * The product units this line moved, which is what stock reservation speaks.
   * A combo expands into its components, each multiplied by the combos sold.
   */
  get stockLines(): IStockLine[] {
    if (!this.isCombo) {
      return [{ productId: this.productId, quantity: this._quantity }];
    }

    return this._components.map((component) => ({
      productId: String(component.product?._id ?? component.product),
      quantity: component.quantity * this._quantity,
    }));
  }

  /** Applied by the pricing engine after the line is built. */
  applyDiscount(discount: number, appliedPromotions: any[] = []): void {
    this._discount = round2(Math.min(Math.max(0, discount), this._total));
    this._netTotal = round2(this._total - this._discount);
    this._appliedPromotions = appliedPromotions;
  }

  public toJSON() {
    return {
      itemType: this._itemType,
      product: this._product ?? null,
      combo: this._combo ?? null,
      components: this._components,
      name: this._name,
      unitPrice: this._unitPrice,
      quantity: this._quantity,
      total: this._total,
      discount: this._discount,
      netTotal: this._netTotal,
      appliedPromotions: this._appliedPromotions,
    };
  }

  static create(item: { product: any; name: string; unitPrice: number; quantity: number }): OrderItemModel {
    const newItem = new OrderItemModel();
    newItem._itemType = OrderItemType.PRODUCT;
    newItem._product = OrderItemModel.plain(item.product);
    newItem._name = item.name;
    newItem._unitPrice = item.unitPrice;
    newItem._quantity = item.quantity;
    newItem._total = round2(item.unitPrice * item.quantity);
    newItem._netTotal = newItem._total;

    return newItem;
  }

  /**
   * A combo line. `components` are the units of each product per single combo,
   * exactly as the combo was defined at the moment of the sale.
   */
  static createCombo(item: {
    combo: any;
    name: string;
    unitPrice: number;
    quantity: number;
    components: IOrderItemComponent[];
  }): OrderItemModel {
    const newItem = new OrderItemModel();
    newItem._itemType = OrderItemType.COMBO;
    newItem._combo = OrderItemModel.plain(item.combo);
    newItem._components = item.components.map((component) => ({
      product: OrderItemModel.plain(component.product),
      name: component.name,
      quantity: component.quantity,
      unitPrice: component.unitPrice,
    }));
    newItem._name = item.name;
    newItem._unitPrice = item.unitPrice;
    newItem._quantity = item.quantity;
    newItem._total = round2(item.unitPrice * item.quantity);
    newItem._netTotal = newItem._total;

    return newItem;
  }

  static hydrate(item: any): OrderItemModel {
    const newItem = new OrderItemModel();
    // Not trusting the schema default: documents written before combos existed
    // were never rewritten, so the field is simply absent on them.
    newItem._itemType = item.itemType ?? OrderItemType.PRODUCT;
    newItem._product = OrderItemModel.plain(item.product);
    newItem._combo = OrderItemModel.plain(item.combo);
    newItem._components = (item.components ?? []).map((component: any) => ({
      product: OrderItemModel.plain(component.product),
      name: component.name,
      quantity: component.quantity,
      unitPrice: component.unitPrice,
    }));
    newItem._name = item.name;
    newItem._unitPrice = item.unitPrice;
    newItem._quantity = item.quantity;
    newItem._total = item.total;
    newItem._discount = item.discount ?? 0;
    // Orders predating discounts stored no net: the gross was what was paid.
    newItem._netTotal = item.netTotal ?? item.total;
    newItem._appliedPromotions = item.appliedPromotions ?? [];

    return newItem;
  }
}
