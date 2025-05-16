import { HttpStatus, Injectable } from "@nestjs/common";
import { InjectModel } from "@nestjs/mongoose";
import { Model } from "mongoose";
import { BaseErrorException } from "../../../../core/domain/exceptions/base.error.exception";
import { CatPaymentMethodModel } from "../../../domain/models/cat-payment-method.model";
import { ICatPaymentMethodRepository } from "../../../domain/repositories/cat-payment-method.repository";
import { CatPaymentMethodSchema } from "../schemas/cat-payment-method.schema";


@Injectable()
export class CatPaymentMethodRepository implements ICatPaymentMethodRepository {
    constructor(
        @InjectModel('CatPaymentMethod') private readonly catPaymentMethodDB: Model<CatPaymentMethodSchema>
    ) { }

    async create(PaymentMethod: CatPaymentMethodModel): Promise<CatPaymentMethodModel> {
        const schema = new this.catPaymentMethodDB(PaymentMethod.toJSON());
        const newCatPaymentMethod = await schema.save();

        if (!newCatPaymentMethod) throw new BaseErrorException(`Payment Method shouldn't be created`, HttpStatus.BAD_REQUEST)

        return CatPaymentMethodModel.hydrate(newCatPaymentMethod)
    }

    async findById(id: string): Promise<CatPaymentMethodModel | null> {
        const paymentMethod = await this.catPaymentMethodDB.findById(id);
        if (!paymentMethod) return null;
        return CatPaymentMethodModel.hydrate(paymentMethod);
    }

    async findAll(): Promise<CatPaymentMethodModel[]> {
        const paymentMethod = await this.catPaymentMethodDB.find();

        return paymentMethod.map((paymentMethod) => CatPaymentMethodModel.hydrate(paymentMethod));
    }
}