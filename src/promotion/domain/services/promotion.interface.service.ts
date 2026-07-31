import { PaginatedResponse } from "../../../core/domain/response/find-all-paginated.response";
import { PromotionModel } from "../models/promotion.model";
import { ICreatePromotion, IPromotionFilterOptions } from "../types/promotion.type";

export interface IPromotionService {
    create(promotion: ICreatePromotion): Promise<PromotionModel>;
    findById(id: string): Promise<PromotionModel>;
    findAll(options: IPromotionFilterOptions): Promise<PaginatedResponse<PromotionModel>>;
    /** Public: what the storefront needs to show a struck-through price. */
    findActiveAutomatic(): Promise<PromotionModel[]>;
    update(id: string, promotion: Partial<ICreatePromotion>): Promise<PromotionModel>;
    delete(id: string): Promise<PromotionModel>;
}
