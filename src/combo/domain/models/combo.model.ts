import { HttpStatus } from '@nestjs/common';
import { BaseErrorException } from '../../../core/domain/exceptions/base.error.exception';
import { BaseModel } from '../../../core/domain/models/base.model';
import { round2 } from '../../../core/domain/utils/money.util';
import { Identifier } from '../../../core/domain/value-objects/identifier';
import { ComboPriceMode } from '../enum/combo-price-mode.enum';
import { ComboItemModel } from './combo-item.model';

/**
 * A bundle sold as one line. Neither `price` nor `stock` is a field: both are
 * derived from the components every time the combo is read, so they can never
 * drift from the catalogue the way a persisted copy would.
 */
export class ComboModel extends BaseModel {
    private _name: string;
    private _description?: string;
    private _images: string[] = [];
    private _items: ComboItemModel[] = [];
    private _priceMode: ComboPriceMode = ComboPriceMode.FIXED;
    private _fixedPrice?: number;
    private _discountPercentage?: number;
    private _isActive = true;

    get name(): string {
        return this._name;
    }

    get items(): ComboItemModel[] {
        return this._items;
    }

    get isActive(): boolean {
        return this._isActive;
    }

    /** What the same products would cost bought separately. */
    get compareAtPrice(): number {
        return round2(this._items.reduce((acc, item) => acc + item.lineTotal, 0));
    }

    /** The price the buyer pays for one combo. */
    get price(): number {
        if (this._priceMode === ComboPriceMode.FIXED) {
            return round2(this._fixedPrice ?? 0);
        }

        return round2((this.compareAtPrice * (100 - (this._discountPercentage ?? 0))) / 100);
    }

    /** Absolute saving against buying the components one by one. */
    get savings(): number {
        return round2(Math.max(0, this.compareAtPrice - this.price));
    }

    /**
     * How many combos can be assembled right now: the scarcest component decides.
     * A combo with no components, or with one that is gone or deactivated, is out
     * of stock rather than infinitely available.
     */
    get stock(): number {
        if (!this._items.length) return 0;

        return this._items.reduce(
            (available, item) => Math.min(available, item.comboUnitsAvailable),
            Number.POSITIVE_INFINITY,
        );
    }

    /** True when every component was resolved and is still sellable. */
    get hasAllComponentsAvailable(): boolean {
        return this._items.length > 0 && this._items.every((item) => item.isAvailable);
    }

    /** Rejects a sale the catalogue cannot back, with the reason the buyer sees. */
    assertSellable(quantity: number): void {
        if (!this._isActive) {
            throw new BaseErrorException(`Combo ${this._name} is not available`, HttpStatus.BAD_REQUEST);
        }

        if (!this.hasAllComponentsAvailable) {
            throw new BaseErrorException(
                `Combo ${this._name} has products that are no longer available`,
                HttpStatus.BAD_REQUEST,
            );
        }

        if (quantity > this.stock) {
            throw new BaseErrorException(
                `Insufficient stock for ${this._name}: ${this.stock} available, ${quantity} requested`,
                HttpStatus.BAD_REQUEST,
            );
        }
    }

    /**
     * The components of `quantity` combos expressed as plain product lines, which
     * is what stock reservation and the order snapshot both speak.
     */
    componentLines(quantity: number): { productId: string; name: string; unitPrice: number; quantity: number }[] {
        return this._items.map((item) => ({
            productId: item.productId,
            name: item.product?.name ?? '',
            unitPrice: item.product?.price ?? 0,
            quantity: item.quantity * quantity,
        }));
    }

    public toJSON() {
        const aggregate = this._id ? { _id: this._id.toValue() } : {};
        return {
            ...aggregate,
            name: this._name,
            description: this._description,
            images: this._images,
            items: this._items.map((item) => item.toJSON()),
            priceMode: this._priceMode,
            fixedPrice: this._fixedPrice,
            discountPercentage: this._discountPercentage,
            isActive: this._isActive,
            // Derived, never persisted: emitted so the API answers with a price and
            // a stock without every caller having to recompute them.
            price: this.price,
            compareAtPrice: this.compareAtPrice,
            savings: this.savings,
            stock: this.stock,
            createdAt: this._createdAt,
            updatedAt: this._updatedAt,
        };
    }

    /**
     * The write side of the aggregate. Validates the price mode here rather than
     * only in the DTO, so a combo can never reach the database priced on a field
     * its own mode ignores.
     */
    static create(combo: any): ComboModel {
        const newCombo = new ComboModel(new Identifier(combo._id));
        newCombo._name = combo.name;
        newCombo._description = combo.description;
        newCombo._images = combo.images ?? [];
        newCombo._items = (combo.items ?? []).map((item: any) => ComboItemModel.create(item));
        newCombo._priceMode = combo.priceMode ?? ComboPriceMode.FIXED;
        newCombo._fixedPrice = combo.fixedPrice;
        newCombo._discountPercentage = combo.discountPercentage;
        newCombo._isActive = combo.isActive ?? true;

        newCombo.assertPriceModeIsConsistent();

        return newCombo;
    }

    static hydrate(combo: any): ComboModel {
        const newCombo = new ComboModel(new Identifier(combo._id));
        newCombo._name = combo.name;
        newCombo._description = combo.description;
        newCombo._images = combo.images ?? [];
        newCombo._items = (combo.items ?? []).map((item: any) => ComboItemModel.hydrate(item));
        newCombo._priceMode = combo.priceMode ?? ComboPriceMode.FIXED;
        newCombo._fixedPrice = combo.fixedPrice;
        newCombo._discountPercentage = combo.discountPercentage;
        newCombo._isActive = combo.isActive ?? true;
        newCombo._createdAt = combo.createdAt;
        newCombo._updatedAt = combo.updatedAt;

        return newCombo;
    }

    private assertPriceModeIsConsistent(): void {
        if (!this._items.length) {
            throw new BaseErrorException('A combo needs at least one product', HttpStatus.BAD_REQUEST);
        }

        const productIds = this._items.map((item) => item.productId);
        if (new Set(productIds).size !== productIds.length) {
            throw new BaseErrorException(
                'A product cannot be listed twice in the same combo, raise its quantity instead',
                HttpStatus.BAD_REQUEST,
            );
        }

        if (this._priceMode === ComboPriceMode.FIXED) {
            if (typeof this._fixedPrice !== 'number') {
                throw new BaseErrorException('A FIXED combo needs a fixedPrice', HttpStatus.BAD_REQUEST);
            }
            // The percentage would be dead data that misleads whoever edits it later.
            this._discountPercentage = undefined;
            return;
        }

        if (typeof this._discountPercentage !== 'number') {
            throw new BaseErrorException(
                'A PERCENTAGE combo needs a discountPercentage',
                HttpStatus.BAD_REQUEST,
            );
        }

        this._fixedPrice = undefined;
    }
}
