/**
 * What a cart line points at. Mirrors OrderItemType, kept separate so the cart
 * context does not have to import from the order module.
 */
export enum CartItemType {
    PRODUCT = 'PRODUCT',
    COMBO = 'COMBO',
}
