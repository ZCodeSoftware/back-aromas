/**
 * Codes of the order-status catalogue (`cat_order_status`).
 *
 * Lives in core, like TypeRoles, because three feature modules and the catalogue
 * itself need to name a status without importing each other. The rows are stored
 * in MongoDB and orders point at them by ObjectId, but the *code* of each row is
 * immutable and mirrored here: the state machine, the stock restore and the
 * revenue classification are business rules, not editable data.
 */
export enum OrderStatus {
    PENDING = 'PENDING',
    PAID = 'PAID',
    SHIPPED = 'SHIPPED',
    DELIVERED = 'DELIVERED',
    CANCELLED = 'CANCELLED',
    REFUNDED = 'REFUNDED',
}
