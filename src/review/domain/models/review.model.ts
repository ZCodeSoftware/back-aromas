import { BaseModel } from '../../../core/domain/models/base.model';
import { Identifier } from '../../../core/domain/value-objects/identifier';

export class ReviewModel extends BaseModel {
  private _user: any;
  private _product: any;
  private _rating: number;
  private _comment?: string;
  private _isActive: boolean;

  private static plain(value: any): any {
    if (value === null || value === undefined) return value;
    return typeof value.toJSON === 'function' ? value.toJSON() : value;
  }

  get userId(): string {
    return String(this._user?._id ?? this._user);
  }

  get productId(): string {
    return String(this._product?._id ?? this._product);
  }

  get isActive(): boolean {
    return this._isActive;
  }

  setRating(rating: number): void {
    this._rating = rating;
  }

  setComment(comment: string): void {
    this._comment = comment;
  }

  setIsActive(isActive: boolean): void {
    this._isActive = isActive;
  }

  public toJSON() {
    const aggregate = this._id ? { _id: this._id.toValue() } : {};
    return {
      ...aggregate,
      user: this._user,
      product: this._product,
      rating: this._rating,
      comment: this._comment,
      isActive: this._isActive,
      createdAt: this._createdAt,
      updatedAt: this._updatedAt,
    };
  }

  static create(review: any): ReviewModel {
    const newReview = new ReviewModel(new Identifier(review._id));
    newReview._user = review.user;
    newReview._product = review.product;
    newReview._rating = review.rating;
    newReview._comment = review.comment;
    newReview._isActive = review.isActive ?? true;

    return newReview;
  }

  static hydrate(review: any): ReviewModel {
    const newReview = new ReviewModel(new Identifier(review._id));
    newReview._user = ReviewModel.plain(review.user);
    newReview._product = ReviewModel.plain(review.product);
    newReview._rating = review.rating;
    newReview._comment = review.comment;
    newReview._isActive = review.isActive;
    newReview._createdAt = review.createdAt;
    newReview._updatedAt = review.updatedAt;

    return newReview;
  }
}
