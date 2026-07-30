export interface ICreateReview {
    productId: string;
    rating: number;
    comment?: string;
}

export interface IUpdateReview {
    rating?: number;
    comment?: string;
    isActive?: boolean;
}

export interface IReviewFilterOptions {
    page?: number;
    limit?: number;
}

export interface IProductRatingStats {
    ratingAvg: number;
    reviewsCount: number;
}
