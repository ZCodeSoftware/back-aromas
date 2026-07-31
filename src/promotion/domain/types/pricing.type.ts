import { OrderChannel } from "../../../order/domain/enum/order-channel.enum";
import { OrderItemType } from "../../../order/domain/enum/order-item-type.enum";
import { PromotionScope } from "../enum/promotion-scope.enum";
import { PromotionValueType } from "../enum/promotion-value-type.enum";

/**
 * A line handed to the pricing engine. The caller has already resolved the price
 * against the live catalogue: the engine only decides what comes off, never what
 * something costs.
 */
export interface IPricingLineInput {
    /**
     * Stable handle for the line within this request. The caller chooses it (the
     * array index does) so two lines of the same product can be told apart on the
     * way back.
     */
    ref: string;
    itemType: OrderItemType;
    productId?: string;
    comboId?: string;
    /** Only on a product line; a combo is never matched by category. */
    categoryId?: string;
    subCategoryId?: string;
    quantity: number;
    unitPrice: number;
    /** Gross: `unitPrice * quantity`. */
    total: number;
}

export interface IPricingRequest {
    lines: IPricingLineInput[];
    /** As the buyer typed it; matching is case-insensitive. */
    couponCode?: string;
    /** Null on an anonymous counter sale, which skips the per-user limit. */
    userId?: string | null;
    channel: OrderChannel;
    /** Never discounted, but part of the total the engine returns. */
    shippingPrice: number;
}

/** What one promotion took off, snapshotted for the order. */
export interface IAppliedPromotion {
    promotion: string;
    code: string | null;
    name: string;
    valueType: PromotionValueType;
    value: number;
    scope: PromotionScope;
    /** Always greater than zero: a promotion that took nothing is not recorded. */
    discount: number;
}

export interface IPricedLine {
    ref: string;
    discount: number;
    /** `total - discount`. */
    netTotal: number;
    appliedPromotions: IAppliedPromotion[];
}

export interface IPricingResult {
    /** Gross sum of the lines, before discounts. */
    subTotalPrice: number;
    discountTotal: number;
    /** `subTotalPrice - discountTotal + shippingPrice`. */
    totalPrice: number;
    shippingPrice: number;
    lines: IPricedLine[];
    /** The same promotions as the lines, consolidated at order level. */
    appliedPromotions: IAppliedPromotion[];
    coupon: { code: string; promotion: string } | null;
    /**
     * Why the coupon did not apply. Only ever set on a preview: at checkout the
     * same condition is a 400, so nobody pays a total they did not agree to.
     */
    couponError?: string;
}
