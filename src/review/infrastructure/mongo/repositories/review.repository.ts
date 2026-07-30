import { HttpStatus, Injectable } from "@nestjs/common";
import { InjectModel } from "@nestjs/mongoose";
import { Model, Types } from "mongoose";
import { BaseErrorException } from "../../../../core/domain/exceptions/base.error.exception";
import { PaginatedResponse } from "../../../../core/domain/response/find-all-paginated.response";
import { round2 } from "../../../../core/domain/utils/money.util";
import { ReviewModel } from "../../../domain/models/review.model";
import { IReviewRepository } from "../../../domain/repositories/review.interface.repository";
import { IProductRatingStats, IReviewFilterOptions } from "../../../domain/types/review.type";
import { ReviewSchema } from "../schemas/review.schema";

const DUPLICATE_KEY = 11000;

@Injectable()
export class ReviewRepository implements IReviewRepository {
    constructor(
        @InjectModel('Review') private readonly reviewDB: Model<ReviewSchema>
    ) { }

    async create(review: ReviewModel): Promise<ReviewModel> {
        try {
            const schema = new this.reviewDB(review.toJSON());
            const newReview = await schema.save();

            await newReview.populate({ path: 'user', select: 'firstName lastName _id' });

            return ReviewModel.hydrate(newReview);
        } catch (error) {
            // The unique (user, product) index is the source of truth here; a
            // read-then-write check would still race.
            if (error?.code === DUPLICATE_KEY) {
                throw new BaseErrorException('You already reviewed this product', HttpStatus.BAD_REQUEST);
            }
            throw error;
        }
    }

    async findById(id: string): Promise<ReviewModel> {
        const review = await this.reviewDB.findById(id);
        if (!review) throw new BaseErrorException('Review not found', HttpStatus.NOT_FOUND);
        return ReviewModel.hydrate(review);
    }

    async findByProduct(
        productId: string,
        options: IReviewFilterOptions,
        includeInactive = false,
    ): Promise<PaginatedResponse<ReviewModel>> {
        return this.paginate(
            { product: productId, ...(includeInactive ? {} : { isActive: true }) },
            options,
            { path: 'user', select: 'firstName lastName _id' },
        );
    }

    async findByUser(userId: string, options: IReviewFilterOptions): Promise<PaginatedResponse<ReviewModel>> {
        return this.paginate(
            { user: userId },
            options,
            { path: 'product', select: 'name images _id' },
        );
    }

    async update(id: string, review: ReviewModel): Promise<ReviewModel> {
        const { rating, comment, isActive } = review.toJSON();

        const updatedReview = await this.reviewDB
            .findByIdAndUpdate(id, { rating, comment, isActive }, { new: true })
            .populate({ path: 'user', select: 'firstName lastName _id' });

        if (!updatedReview) {
            throw new BaseErrorException('Review not found', HttpStatus.NOT_FOUND);
        }

        return ReviewModel.hydrate(updatedReview);
    }

    async calculateProductStats(productId: string): Promise<IProductRatingStats> {
        const [stats] = await this.reviewDB.aggregate([
            { $match: { product: new Types.ObjectId(String(productId)), isActive: true } },
            { $group: { _id: null, ratingAvg: { $avg: '$rating' }, reviewsCount: { $sum: 1 } } },
        ]);

        if (!stats) return { ratingAvg: 0, reviewsCount: 0 };

        return { ratingAvg: round2(stats.ratingAvg), reviewsCount: stats.reviewsCount };
    }

    private async paginate(
        filters: Record<string, any>,
        options: IReviewFilterOptions,
        populate: { path: string; select: string },
    ): Promise<PaginatedResponse<ReviewModel>> {
        const { page = 1, limit = 10 } = options;

        const currentPage = Math.max(1, page);
        const itemsPerPage = Math.min(Math.max(1, limit), 100);
        const skip = (currentPage - 1) * itemsPerPage;

        const totalItems = await this.reviewDB.countDocuments(filters);
        const totalPages = Math.ceil(totalItems / itemsPerPage);

        const reviews = await this.reviewDB
            .find(filters)
            .populate(populate)
            .skip(skip)
            .limit(itemsPerPage)
            .sort({ createdAt: -1 });

        return {
            data: reviews?.map((review) => ReviewModel.hydrate(review)) || [],
            pagination: {
                currentPage,
                totalPages,
                totalItems,
                itemsPerPage,
                hasNextPage: currentPage < totalPages,
                hasPrevPage: currentPage > 1,
            },
        };
    }
}
