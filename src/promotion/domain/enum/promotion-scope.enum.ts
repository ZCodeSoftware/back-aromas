/** What a promotion is allowed to touch. */
export enum PromotionScope {
    /** Every line of the sale, products and combos alike. */
    ALL = 'ALL',
    CATEGORY = 'CATEGORY',
    SUBCATEGORY = 'SUBCATEGORY',
    /** An explicit list of products. */
    PRODUCTS = 'PRODUCTS',
    /** An explicit list of combos. */
    COMBOS = 'COMBOS',
}

/**
 * Scopes that reach a combo line. A combo is already sold below the sum of its
 * parts, so a category or product rule must not reach inside it: that would
 * discount the same components twice and make the final price impossible to
 * explain to the buyer.
 */
export const COMBO_SCOPES: PromotionScope[] = [PromotionScope.ALL, PromotionScope.COMBOS];
