/** How a combo prices itself against the sum of its components. */
export enum ComboPriceMode {
    /** The admin types the final price; the components only decide the stock. */
    FIXED = 'FIXED',
    /** A percentage off the sum, so the price follows the component prices. */
    PERCENTAGE = 'PERCENTAGE',
}
