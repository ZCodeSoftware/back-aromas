/**
 * Prices are stored as plain Numbers, so every arithmetic result has to be
 * normalised to 2 decimals to avoid float drift piling up in cart/order totals.
 */
export const round2 = (value: number): number => Math.round((value + Number.EPSILON) * 100) / 100;
