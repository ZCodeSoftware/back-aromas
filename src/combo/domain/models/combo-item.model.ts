import { round2 } from '../../../core/domain/utils/money.util';

/**
 * Value object: one component of a combo. Like CartItemModel, it is identified
 * by its product rather than by an id of its own, and `_product` holds whatever
 * persistence handed over — a populated document or a bare ObjectId — always
 * flattened to a plain object.
 */
export class ComboItemModel {
    private _product: any;
    private _quantity: number;

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

    /**
     * True only when the component was populated and can still be sold. A bare
     * ObjectId counts as unavailable on purpose: deriving a price from a
     * reference we never read would silently invent a number.
     */
    get isAvailable(): boolean {
        return typeof this._product === 'object' && this._product !== null
            && typeof this._product.price === 'number'
            && this._product.isActive !== false;
    }

    /** What these units are worth at the current catalogue price. */
    get lineTotal(): number {
        if (!this.isAvailable) return 0;

        return round2(this._product.price * this._quantity);
    }

    /** How many whole combos this single component allows. */
    get comboUnitsAvailable(): number {
        if (!this.isAvailable) return 0;

        return Math.floor((this._product.stock ?? 0) / this._quantity);
    }

    public toJSON() {
        return {
            product: this._product,
            quantity: this._quantity,
        };
    }

    static create(item: { product: any; quantity: number }): ComboItemModel {
        const newItem = new ComboItemModel();
        newItem._product = ComboItemModel.plain(item.product);
        newItem._quantity = item.quantity;

        return newItem;
    }

    static hydrate(item: any): ComboItemModel {
        return ComboItemModel.create(item);
    }
}
