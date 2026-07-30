import { ICartSnapshot } from "../types/analytics.type";

/**
 * Cart reads for the conversion report. Point-in-time only: there is one cart per
 * user, mutated in place and emptied on checkout, so cart history does not exist.
 */
export interface IAnalyticsCartRepository {
    /** Non-empty carts, and how many of them have not been touched since `cutoff`. */
    getCartSnapshot(cutoff: Date): Promise<ICartSnapshot>;
}
