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

    async findById(id: string): Promise<{ _id: string; name: string } | null> {
        const paymentMethod = await this.catPaymentMethodDB.findById(id).select('name').lean();

        if (!paymentMethod) return null;

        return { _id: String(paymentMethod._id), name: paymentMethod.name };
    }
}
