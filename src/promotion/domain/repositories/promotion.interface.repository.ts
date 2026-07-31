import { PaginatedResponse } from "../../../core/domain/response/find-all-paginated.response";
import { PromotionModel } from "../models/promotion.model";
import { IPromotionFilterOptions } from "../types/promotion.type";

export interface IPromotionRepository {
    create(promotion: PromotionModel): Promise<PromotionModel>;
    findById(id: string): Promise<PromotionModel>;
    findAll(options: IPromotionFilterOptions): Promise<PaginatedResponse<PromotionModel>>;
    /** Active, in force right now and carrying no code. */
    findActiveAutomatic(when: Date): Promise<PromotionModel[]>;
    /** Case-insensitive; returns the row even if expired, so callers can say why. */
    findByCode(code: string): Promise<PromotionModel | null>;
    update(id: string, promotion: PromotionModel): Promise<PromotionModel>;
    /** Soft delete: flips isActive to false, the row is kept. */
    softDelete(id: string): Promise<PromotionModel>;
    /**
     * Increments `usedCount` only while it is still below `usageLimit`, in one
     * guarded update. Returns false when the last use was taken by someone else,
     * which is the only thing standing between two simultaneous checkouts and an
     * over-redeemed coupon.
     */
    consumeUse(id: string): Promise<boolean>;
    /** Gives a use back when the order it belonged to could not be written. */
    releaseUse(id: string): Promise<void>;
}
