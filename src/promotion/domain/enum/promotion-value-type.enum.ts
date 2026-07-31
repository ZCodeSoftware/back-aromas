/** How the discount of a promotion is expressed. */
export enum PromotionValueType {
    /** A percentage off each matching line. */
    PERCENTAGE = 'PERCENTAGE',
    /**
     * A flat amount off the order, split across the matching lines in proportion
     * to what each is worth. Never per line: `$500 off` on a three-line cart has
     * to take $500 in total, not $1500.
     */
    FIXED = 'FIXED',
}
