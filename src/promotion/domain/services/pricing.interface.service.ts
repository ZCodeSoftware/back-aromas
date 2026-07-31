import { IPricingRequest, IPricingResult } from "../types/pricing.type";

/**
 * The single place that decides what comes off a sale. Both the online checkout
 * and the counter share it so the shop can never charge two different totals for
 * the same cart, and the storefront preview calls the very same code path.
 */
export interface IPricingService {
    /**
     * Prices a set of lines. Read-only: it verifies the usage limits but does not
     * consume them, so a preview can be called as often as the UI needs.
     */
    price(request: IPricingRequest): Promise<IPricingResult>;
    /**
     * Burns one use of every promotion in the result. Must run before the order is
     * written, so a coupon that ran out is rejected before any stock is taken.
     */
    commitUsage(result: IPricingResult, userId?: string | null, orderId?: string): Promise<void>;
    /** Gives those uses back when the order could not be persisted. */
    revertUsage(result: IPricingResult, userId?: string | null): Promise<void>;
}
