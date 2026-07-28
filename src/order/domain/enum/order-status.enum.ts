export enum OrderStatus {
    PENDING = 'PENDING',
    PAID = 'PAID',
    SHIPPED = 'SHIPPED',
    DELIVERED = 'DELIVERED',
    CANCELLED = 'CANCELLED',
    REFUNDED = 'REFUNDED',
}

/**
 * Only these moves are accepted. DELIVERED, CANCELLED and REFUNDED are terminal,
 * which is also what makes cancelling and refunding idempotent.
 *
 * REFUNDED is distinct from CANCELLED on purpose: cancelled means the sale never
 * completed, refunded means the money was taken and given back. A counter sale is
 * born PAID, so collapsing the two would lose that difference forever.
 */
export const ALLOWED_TRANSITIONS: Record<OrderStatus, OrderStatus[]> = {
    [OrderStatus.PENDING]: [OrderStatus.PAID, OrderStatus.CANCELLED],
    [OrderStatus.PAID]: [OrderStatus.SHIPPED, OrderStatus.CANCELLED, OrderStatus.REFUNDED],
    [OrderStatus.SHIPPED]: [OrderStatus.DELIVERED],
    [OrderStatus.DELIVERED]: [],
    [OrderStatus.CANCELLED]: [],
    [OrderStatus.REFUNDED]: [],
};

/** Statuses that count as a completed sale for reviews and analytics. */
export const PURCHASED_STATUSES = [OrderStatus.PAID, OrderStatus.SHIPPED, OrderStatus.DELIVERED];

/** Statuses where the money went back to the buyer, so they are never revenue. */
export const NON_REVENUE_STATUSES = [OrderStatus.CANCELLED, OrderStatus.REFUNDED];

/**
 * Exact complement of NON_REVENUE_STATUSES, enumerated rather than expressed as a
 * `$nin`: only `$in` produces tight index bounds on { status, createdAt }.
 */
export const REVENUE_STATUSES = [
    OrderStatus.PENDING,
    OrderStatus.PAID,
    OrderStatus.SHIPPED,
    OrderStatus.DELIVERED,
];

/** Moving into one of these must give the reserved units back to the catalogue. */
export const STOCK_RESTORING_STATUSES = [OrderStatus.CANCELLED, OrderStatus.REFUNDED];
