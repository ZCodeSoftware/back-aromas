import { Injectable } from "@nestjs/common";
import { InjectModel } from "@nestjs/mongoose";
import { Model } from "mongoose";
import { Product } from "../../../../core/infrastructure/mongo/schemas/public/product.schema";
import { User } from "../../../../core/infrastructure/mongo/schemas/public/user.schema";
import { ICatalogueRepository } from "../../../domain/repositories/catalogue.interface.repository";

@Injectable()
export class CatalogueRepository implements ICatalogueRepository {
    constructor(
        @InjectModel('Product') private readonly productDB: Model<Product>,
        @InjectModel('User') private readonly userDB: Model<User>,
    ) { }

    async countProducts(): Promise<number> {
        return this.productDB.countDocuments({ isActive: true });
    }

    async countUsers(): Promise<number> {
        return this.userDB.countDocuments({ isActive: true });
    }
}
