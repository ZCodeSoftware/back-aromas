import { PaginatedResponse } from "../../../core/domain/response/find-all-paginated.response";
import { ReviewModel } from "../models/review.model";
import { ICreateReview, IReviewFilterOptions, IUpdateReview } from "../types/review.type";

export interface IReviewService {
    /** Only customers with a completed purchase of that product may review it. */
    create(userId: string, review: ICreateReview): Promise<ReviewModel>;
    findByProduct(productId: string, options: IReviewFilterOptions, includeInactive?: boolean): Promise<PaginatedResponse<ReviewModel>>;
    findByUser(userId: string, options: IReviewFilterOptions): Promise<PaginatedResponse<ReviewModel>>;
    /** Owner edits rating and comment; admin can additionally deactivate. */
    update(id: string, requesterId: string, review: IUpdateReview): Promise<ReviewModel>;
    /** Soft delete: owner or admin flips isActive to false, the row is kept. */
    delete(id: string, requesterId: string): Promise<ReviewModel>;
}
