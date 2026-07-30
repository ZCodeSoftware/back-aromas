import { HttpStatus, Inject, Injectable } from "@nestjs/common";
import { TypeRoles } from "../../../core/domain/enums/type-roles.enum";
import { BaseErrorException } from "../../../core/domain/exceptions/base.error.exception";
import { IUserRepository } from "../../../core/domain/repositories/user.interface.repository";
import { PaginatedResponse } from "../../../core/domain/response/find-all-paginated.response";
import SymbolsOrder from "../../../order/symbols-order";
import SymbolsProduct from "../../../product/symbols-product";
import SymbolsUser from "../../../user/symbols-user";
import { ReviewModel } from "../../domain/models/review.model";
import { IOrderRepository } from "../../domain/repositories/order.interface.repository";
import { IProductRepository } from "../../domain/repositories/product.interface.repository";
import { IReviewRepository } from "../../domain/repositories/review.interface.repository";
import { IReviewService } from "../../domain/services/review.interface.service";
import { ICreateReview, IReviewFilterOptions, IUpdateReview } from "../../domain/types/review.type";
import SymbolsReview from "../../symbols-review";

@Injectable()
export class ReviewService implements IReviewService {
    constructor(
        @Inject(SymbolsReview.IReviewRepository)
        private readonly reviewRepository: IReviewRepository,
        @Inject(SymbolsOrder.IOrderRepository)
        private readonly orderRepository: IOrderRepository,
        @Inject(SymbolsProduct.IProductRepository)
        private readonly productRepository: IProductRepository,
        @Inject(SymbolsUser.IUserRepository)
        private readonly userRepository: IUserRepository,
    ) { }

    async create(userId: string, review: ICreateReview): Promise<ReviewModel> {
        const productExists = await this.productRepository.exists(review.productId);
        if (!productExists) {
            throw new BaseErrorException('Product not found', HttpStatus.NOT_FOUND);
        }

        const hasPurchased = await this.orderRepository.hasPurchasedProduct(userId, review.productId);
        if (!hasPurchased) {
            throw new BaseErrorException(
                'You can only review products you purchased',
                HttpStatus.FORBIDDEN,
            );
        }

        const createdReview = await this.reviewRepository.create(
            ReviewModel.create({ user: userId, product: review.productId, rating: review.rating, comment: review.comment }),
        );

        await this.refreshProductStats(review.productId);

        return createdReview;
    }

    async findByProduct(
        productId: string,
        options: IReviewFilterOptions,
        includeInactive = false,
    ): Promise<PaginatedResponse<ReviewModel>> {
        return this.reviewRepository.findByProduct(productId, options, includeInactive);
    }

    async findByUser(userId: string, options: IReviewFilterOptions): Promise<PaginatedResponse<ReviewModel>> {
        return this.reviewRepository.findByUser(userId, options);
    }

    async update(id: string, requesterId: string, review: IUpdateReview): Promise<ReviewModel> {
        const existingReview = await this.reviewRepository.findById(id);
        const isOwner = existingReview.userId === String(requesterId);
        const isAdmin = await this.isAdmin(requesterId);

        if (!isOwner && !isAdmin) {
            throw new BaseErrorException(
                'Access denied: this review belongs to another user',
                HttpStatus.FORBIDDEN,
            );
        }

        if (review.rating !== undefined) existingReview.setRating(review.rating);
        if (review.comment !== undefined) existingReview.setComment(review.comment);

        // Moderation is an admin-only lever; an owner cannot hide or restore
        // their own review to dodge it.
        if (review.isActive !== undefined) {
            if (!isAdmin) {
                throw new BaseErrorException(
                    'Only an administrator can change the visibility of a review',
                    HttpStatus.FORBIDDEN,
                );
            }
            existingReview.setIsActive(review.isActive);
        }

        const updatedReview = await this.reviewRepository.update(id, existingReview);

        await this.refreshProductStats(existingReview.productId);

        return updatedReview;
    }

    async delete(id: string, requesterId: string): Promise<ReviewModel> {
        const existingReview = await this.reviewRepository.findById(id);
        const isOwner = existingReview.userId === String(requesterId);
        const isAdmin = await this.isAdmin(requesterId);

        if (!isOwner && !isAdmin) {
            throw new BaseErrorException(
                'Access denied: this review belongs to another user',
                HttpStatus.FORBIDDEN,
            );
        }

        existingReview.setIsActive(false);

        const deletedReview = await this.reviewRepository.update(id, existingReview);

        await this.refreshProductStats(existingReview.productId);

        return deletedReview;
    }

    /** Recomputes the denormalised rating that lives on the product document. */
    private async refreshProductStats(productId: string): Promise<void> {
        const stats = await this.reviewRepository.calculateProductStats(productId);
        await this.productRepository.updateRatingStats(productId, stats);
    }

    private async isAdmin(userId: string): Promise<boolean> {
        const user = await this.userRepository.findById(userId);
        return (user.toJSON().roles ?? []).some((role: { name: string }) => role.name === TypeRoles.ADMIN);
    }
}
