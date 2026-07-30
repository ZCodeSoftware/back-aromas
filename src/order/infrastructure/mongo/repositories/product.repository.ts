import { Injectable } from "@nestjs/common";
import { InjectModel } from "@nestjs/mongoose";
import { Model } from "mongoose";
import { Product } from "../../../../core/infrastructure/mongo/schemas/public/product.schema";
import { IProductRepository } from "../../../domain/repositories/product.interface.repository";
import { IOrderProduct } from "../../../domain/types/order.type";

@Injectable()
export class ProductRepository implements IProductRepository {
    constructor(
        @InjectModel('Product') private readonly productDB: Model<Product>
    ) { }

    async findById(id: string): Promise<IOrderProduct | null> {
        const product = await this.productDB
            .findById(id)
            .select('name price stock isActive')
            .lean();

        if (!product) return null;

        return {
            _id: String(product._id),
            name: product.name,
            price: product.price,
            stock: product.stock,
            isActive: product.isActive,
        };
    }

    async decrementStock(productId: string, quantity: number): Promise<boolean> {
        // The `stock: { $gte }` guard is what makes this safe under concurrency:
        // two simultaneous checkouts cannot both take the last unit.
        const result = await this.productDB.updateOne(
            { _id: productId, stock: { $gte: quantity } },
            { $inc: { stock: -quantity } },
        );

        return result.modifiedCount === 1;
    }

    async incrementStock(productId: string, quantity: number): Promise<void> {
        await this.productDB.updateOne({ _id: productId }, { $inc: { stock: quantity } });
    }
}
