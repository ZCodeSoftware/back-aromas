/**
 * What a sale line stands for. Documents written before combos existed carry no
 * such field, so every read defaults a missing value to PRODUCT.
 */
export enum OrderItemType {
    PRODUCT = 'PRODUCT',
    COMBO = 'COMBO',
}
