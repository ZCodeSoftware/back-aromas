import { Injectable } from "@nestjs/common";
import { InjectModel } from "@nestjs/mongoose";
import { Model } from "mongoose";
import { IPromotionUsageRepository } from "../../../domain/repositories/promotion-usage.interface.repository";
import { ICreatePromotionUsage } from "../../../domain/types/promotion.type";
import { PromotionUsageSchema } from "../schemas/promotion-usage.schema";

@Injectable()
export class PromotionUsageRepository implements IPromotionUsageRepository {
    constructor(
        @InjectModel('PromotionUsage') private readonly usageDB: Model<PromotionUsageSchema>
    ) { }

    async create(usage: ICreatePromotionUsage): Promise<void> {
        await this.usageDB.create({
            promotion: usage.promotionId,
            user: usage.userId ?? undefined,
            order: usage.orderId ?? undefined,
            discount: usage.discount,
        });
    }

    async countByUser(promotionId: string, userId: string): Promise<number> {
        return this.usageDB.countDocuments({ promotion: promotionId, user: userId });
    }

    /**
     * Removes the row written moments ago for an order that never got persisted.
     * Newest-first rather than by id because the caller holds no handle on it, and
     * the compensating path runs right after the insert.
     */
    async deleteLast(promotionId: string, userId?: string | null): Promise<void> {
        const last = await this.usageDB
            .findOne({ promotion: promotionId, user: userId ?? undefined })
            .sort({ createdAt: -1 })
            .select('_id');

        if (last) await this.usageDB.deleteOne({ _id: last._id });
    }
}
