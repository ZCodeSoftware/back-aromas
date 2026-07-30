import { Injectable } from "@nestjs/common";
import { InjectModel } from "@nestjs/mongoose";
import { Model } from "mongoose";
import { Product } from "../../../../core/infrastructure/mongo/schemas/public/product.schema";
import { IProductRepository } from "../../../domain/repositories/product.interface.repository";
import { IProductRatingStats } from "../../../domain/types/review.type";

@Injectable()
export class ProductRepository implements IProductRepository {
    constructor(
        @InjectModel('Product') private readonly productDB: Model<Product>
    ) { }

    async exists(id: string): Promise<boolean> {
        const product = await this.productDB.exists({ _id: id });
        return Boolean(product);
    }

    async updateRatingStats(productId: string, stats: IProductRatingStats): Promise<void> {
        await this.productDB.updateOne(
            { _id: productId },
            { ratingAvg: stats.ratingAvg, reviewsCount: stats.reviewsCount },
        );
    }
}
