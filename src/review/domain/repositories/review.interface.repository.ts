import { PaginatedResponse } from "../../../core/domain/response/find-all-paginated.response";
import { ReviewModel } from "../models/review.model";
import { IProductRatingStats, IReviewFilterOptions } from "../types/review.type";

export interface IReviewRepository {
    create(review: ReviewModel): Promise<ReviewModel>;
    /** Throws NOT_FOUND when the review does not exist. */
    findById(id: string): Promise<ReviewModel>;
    /** Active reviews of a product, or every review when `includeInactive` is set. */
    findByProduct(productId: string, options: IReviewFilterOptions, includeInactive?: boolean): Promise<PaginatedResponse<ReviewModel>>;
    findByUser(userId: string, options: IReviewFilterOptions): Promise<PaginatedResponse<ReviewModel>>;
    update(id: string, review: ReviewModel): Promise<ReviewModel>;
    /** Average and count over the active reviews of a product. */
    calculateProductStats(productId: string): Promise<IProductRatingStats>;
}
