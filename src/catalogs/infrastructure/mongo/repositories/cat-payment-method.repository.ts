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
        const paymentMethod = await this.catPaymentMethodDB.findOne({ _id: id, isActive: true });
        if (!paymentMethod) return null;
        return CatPaymentMethodModel.hydrate(paymentMethod);
    }

    async findAll(): Promise<CatPaymentMethodModel[]> {
        const paymentMethod = await this.catPaymentMethodDB.find({ isActive: true });

        return paymentMethod.map((paymentMethod) => CatPaymentMethodModel.hydrate(paymentMethod));
    }

    async update(id: string, paymentMethod: CatPaymentMethodModel): Promise<CatPaymentMethodModel> {
        // Undefined fields are dropped so a partial body only touches what it sends.
        const updateObject = Object.fromEntries(
            Object.entries(paymentMethod.toJSON()).filter(([key, value]) => value !== undefined && key !== '_id')
        );

        const paymentMethodToUpdate = await this.catPaymentMethodDB.findByIdAndUpdate(id, updateObject, { new: true });

        if (!paymentMethodToUpdate) throw new BaseErrorException(`Payment Method not found`, HttpStatus.NOT_FOUND)

        return CatPaymentMethodModel.hydrate(paymentMethodToUpdate);
    }

    async softDelete(id: string): Promise<CatPaymentMethodModel> {
        const paymentMethod = await this.catPaymentMethodDB.findByIdAndUpdate(id, { isActive: false }, { new: true });

        if (!paymentMethod) throw new BaseErrorException(`Payment Method not found`, HttpStatus.NOT_FOUND)

        return CatPaymentMethodModel.hydrate(paymentMethod);
    }
}
