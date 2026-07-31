import { Injectable } from "@nestjs/common";
import { InjectModel } from "@nestjs/mongoose";
import { Model } from "mongoose";
import { Product } from "../../../../core/infrastructure/mongo/schemas/public/product.schema";
import { IProductRepository } from "../../../domain/repositories/product.interface.repository";
import { IComboProduct } from "../../../domain/types/combo.type";

@Injectable()
export class ProductRepository implements IProductRepository {
    constructor(
        @InjectModel('Product') private readonly productDB: Model<Product>
    ) { }

    async findById(id: string): Promise<IComboProduct | null> {
        const product = await this.productDB
            .findById(id)
            .select('name price stock isActive images')
            .lean();

        if (!product) return null;

        return {
            _id: String(product._id),
            name: product.name,
            price: product.price,
            stock: product.stock,
            isActive: product.isActive,
            images: product.images ?? [],
        };
    }
}
