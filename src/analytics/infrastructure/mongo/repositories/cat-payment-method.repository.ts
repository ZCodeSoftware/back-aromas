import { Injectable } from "@nestjs/common";
import { InjectModel } from "@nestjs/mongoose";
import { Model } from "mongoose";
import { CatPaymentMethod } from "../../../../core/infrastructure/mongo/schemas/catalogs/cat-payment-method.schema";
import { ICatPaymentMethodRepository } from "../../../domain/repositories/cat-payment-method.interface.repository";

@Injectable()
export class CatPaymentMethodRepository implements ICatPaymentMethodRepository {
    constructor(
        @InjectModel('CatPaymentMethod') private readonly catPaymentMethodDB: Model<CatPaymentMethod>
    ) { }

    async findAllNames(): Promise<{ _id: string; name: string }[]> {
        // Inactive methods are included on purpose: an order placed before a method
        // was retired still has to show its name.
        const rows = await this.catPaymentMethodDB.find({}).select('name').lean();

        return rows.map((row) => ({ _id: String(row._id), name: row.name }));
    }
}
