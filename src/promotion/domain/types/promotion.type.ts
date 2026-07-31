import { PromotionScope } from "../enum/promotion-scope.enum";
import { PromotionValueType } from "../enum/promotion-value-type.enum";

export interface ICreatePromotion {
    name: string;
    description?: string;
    scope: PromotionScope;
    categories?: string[];
    subCategories?: string[];
    products?: string[];
    combos?: string[];
    valueType: PromotionValueType;
    value: number;
    /** Absent means automatic: it applies on its own, with nothing to type in. */
    code?: string;
    startsAt?: Date;
    endsAt?: Date;
    minPurchase?: number;
    usageLimit?: number;
    usageLimitPerUser?: number;
    isActive?: boolean;
}

export interface IPromotionFilterOptions {
    page?: number;
    limit?: number;
    search?: string;
    isActive?: boolean;
    /** Admin listing: bring the soft-deleted promotions back too. */
    includeInactive?: boolean;
}

/** One redemption, as the usage repository writes it. */
export interface ICreatePromotionUsage {
    promotionId: string;
    userId?: string | null;
    orderId?: string;
    discount: number;
}
