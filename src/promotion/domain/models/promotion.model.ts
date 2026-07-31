import { HttpStatus } from '@nestjs/common';
import { BaseErrorException } from '../../../core/domain/exceptions/base.error.exception';
import { BaseModel } from '../../../core/domain/models/base.model';
import { round2 } from '../../../core/domain/utils/money.util';
import { Identifier } from '../../../core/domain/value-objects/identifier';
import { OrderItemType } from '../../../order/domain/enum/order-item-type.enum';
import { COMBO_SCOPES, PromotionScope } from '../enum/promotion-scope.enum';
import { PromotionValueType } from '../enum/promotion-value-type.enum';
import { IPricingLineInput } from '../types/pricing.type';

/** Ids of a reference list, flattened whether they came populated or bare. */
const toIds = (references: any[] = []): string[] =>
    references.map((reference) => String(reference?._id ?? reference));

export class PromotionModel extends BaseModel {
    private _name: string;
    private _description?: string;
    private _scope: PromotionScope = PromotionScope.ALL;
    private _categories: string[] = [];
    private _subCategories: string[] = [];
    private _products: string[] = [];
    private _combos: string[] = [];
    private _valueType: PromotionValueType;
    private _value: number;
    private _code?: string;
    private _startsAt?: Date;
    private _endsAt?: Date;
    private _minPurchase?: number;
    private _usageLimit?: number;
    private _usageLimitPerUser?: number;
    private _usedCount = 0;
    private _isActive = true;

    get promotionId(): string {
        return this._id?.toValue() ? String(this._id.toValue()) : null;
    }

    get name(): string {
        return this._name;
    }

    get scope(): PromotionScope {
        return this._scope;
    }

    get valueType(): PromotionValueType {
        return this._valueType;
    }

    get value(): number {
        return this._value;
    }

    get code(): string | null {
        return this._code ?? null;
    }

    /** A promotion with no code applies on its own, with nothing to type in. */
    get isAutomatic(): boolean {
        return !this._code;
    }

    get isActive(): boolean {
        return this._isActive;
    }

    get usageLimit(): number | undefined {
        return this._usageLimit;
    }

    get usageLimitPerUser(): number | undefined {
        return this._usageLimitPerUser;
    }

    get usedCount(): number {
        return this._usedCount;
    }

    get minPurchase(): number | undefined {
        return this._minPurchase;
    }

    /** Inside its date window, if it has one. Both ends are optional. */
    isValidAt(when: Date = new Date()): boolean {
        if (this._startsAt && when < new Date(this._startsAt)) return false;
        if (this._endsAt && when > new Date(this._endsAt)) return false;

        return true;
    }

    /** Evaluated against the gross subtotal, shipping excluded. */
    reachesMinPurchase(subTotal: number): boolean {
        return this._minPurchase === undefined || subTotal >= this._minPurchase;
    }

    get hasUsesLeft(): boolean {
        return this._usageLimit === undefined || this._usedCount < this._usageLimit;
    }

    /**
     * Whether this promotion reaches a given line. A combo line is only ever
     * matched by ALL or COMBOS: its components are already sold below list price,
     * so letting a category or product rule inside would discount them twice.
     */
    matches(line: IPricingLineInput): boolean {
        if (line.itemType === OrderItemType.COMBO) {
            if (!COMBO_SCOPES.includes(this._scope)) return false;

            return this._scope === PromotionScope.ALL
                ? true
                : this._combos.includes(String(line.comboId));
        }

        switch (this._scope) {
            case PromotionScope.ALL:
                return true;
            case PromotionScope.CATEGORY:
                return !!line.categoryId && this._categories.includes(String(line.categoryId));
            case PromotionScope.SUBCATEGORY:
                return !!line.subCategoryId && this._subCategories.includes(String(line.subCategoryId));
            case PromotionScope.PRODUCTS:
                return !!line.productId && this._products.includes(String(line.productId));
            // A combo-scoped promotion never reaches a loose product.
            case PromotionScope.COMBOS:
            default:
                return false;
        }
    }

    /**
     * What comes off a single line worth `lineNet`, capped so a line can never go
     * negative. FIXED is not handled here: it is an order-level amount that has to
     * be split across every matching line at once, which the pricing service does.
     */
    discountFor(lineNet: number): number {
        if (this._valueType !== PromotionValueType.PERCENTAGE) {
            throw new BaseErrorException(
                'A FIXED promotion is allocated across lines, not computed per line',
                HttpStatus.INTERNAL_SERVER_ERROR,
            );
        }

        return round2(Math.min(round2((lineNet * this._value) / 100), lineNet));
    }

    public toJSON() {
        const aggregate = this._id ? { _id: this._id.toValue() } : {};
        return {
            ...aggregate,
            name: this._name,
            description: this._description,
            scope: this._scope,
            categories: this._categories,
            subCategories: this._subCategories,
            products: this._products,
            combos: this._combos,
            valueType: this._valueType,
            value: this._value,
            code: this._code ?? null,
            startsAt: this._startsAt ?? null,
            endsAt: this._endsAt ?? null,
            minPurchase: this._minPurchase,
            usageLimit: this._usageLimit,
            usageLimitPerUser: this._usageLimitPerUser,
            usedCount: this._usedCount,
            isActive: this._isActive,
            createdAt: this._createdAt,
            updatedAt: this._updatedAt,
        };
    }

    static create(promotion: any): PromotionModel {
        const model = PromotionModel.assign(new PromotionModel(new Identifier(promotion._id)), promotion);
        model._usedCount = promotion.usedCount ?? 0;

        model.assertScopeIsConsistent();
        model.assertValueIsInRange();

        return model;
    }

    static hydrate(promotion: any): PromotionModel {
        const model = PromotionModel.assign(new PromotionModel(new Identifier(promotion._id)), promotion);
        model._usedCount = promotion.usedCount ?? 0;
        model._createdAt = promotion.createdAt;
        model._updatedAt = promotion.updatedAt;

        return model;
    }

    private static assign(model: PromotionModel, promotion: any): PromotionModel {
        model._name = promotion.name;
        model._description = promotion.description;
        model._scope = promotion.scope ?? PromotionScope.ALL;
        model._categories = toIds(promotion.categories);
        model._subCategories = toIds(promotion.subCategories);
        model._products = toIds(promotion.products);
        model._combos = toIds(promotion.combos);
        model._valueType = promotion.valueType;
        model._value = promotion.value;
        model._code = promotion.code ? String(promotion.code).trim().toUpperCase() : undefined;
        model._startsAt = promotion.startsAt ? new Date(promotion.startsAt) : undefined;
        model._endsAt = promotion.endsAt ? new Date(promotion.endsAt) : undefined;
        model._minPurchase = promotion.minPurchase ?? undefined;
        model._usageLimit = promotion.usageLimit ?? undefined;
        model._usageLimitPerUser = promotion.usageLimitPerUser ?? undefined;
        model._isActive = promotion.isActive ?? true;

        return model;
    }

    /**
     * A scoped promotion with an empty list would silently match nothing, which
     * looks to the shop owner like the discount is broken rather than misconfigured.
     */
    private assertScopeIsConsistent(): void {
        const required: Partial<Record<PromotionScope, { list: string[]; label: string }>> = {
            [PromotionScope.CATEGORY]: { list: this._categories, label: 'category' },
            [PromotionScope.SUBCATEGORY]: { list: this._subCategories, label: 'sub-category' },
            [PromotionScope.PRODUCTS]: { list: this._products, label: 'product' },
            [PromotionScope.COMBOS]: { list: this._combos, label: 'combo' },
        };

        const rule = required[this._scope];

        if (rule && !rule.list.length) {
            throw new BaseErrorException(
                `A ${this._scope} promotion needs at least one ${rule.label}`,
                HttpStatus.BAD_REQUEST,
            );
        }

        if (this._startsAt && this._endsAt && this._startsAt > this._endsAt) {
            throw new BaseErrorException(
                'The promotion cannot end before it starts',
                HttpStatus.BAD_REQUEST,
            );
        }
    }

    private assertValueIsInRange(): void {
        if (this._value <= 0) {
            throw new BaseErrorException('The discount must be greater than 0', HttpStatus.BAD_REQUEST);
        }

        if (this._valueType === PromotionValueType.PERCENTAGE && this._value > 100) {
            throw new BaseErrorException(
                'A percentage discount cannot be over 100',
                HttpStatus.BAD_REQUEST,
            );
        }
    }
}
