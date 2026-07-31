import { ICreatePromotionUsage } from "../types/promotion.type";

export interface IPromotionUsageRepository {
    create(usage: ICreatePromotionUsage): Promise<void>;
    /** How many times this person has already used this promotion. */
    countByUser(promotionId: string, userId: string): Promise<number>;
    /** Undoes the record written for an order that never got persisted. */
    deleteLast(promotionId: string, userId?: string | null): Promise<void>;
}
