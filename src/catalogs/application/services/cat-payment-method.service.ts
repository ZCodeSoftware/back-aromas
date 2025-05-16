import { HttpStatus, Inject, Injectable } from "@nestjs/common";
import { BaseErrorException } from "../../../core/domain/exceptions/base.error.exception";
import { CatPaymentMethodModel } from "../../domain/models/cat-payment-method.model";
import { ICatPaymentMethodRepository } from "../../domain/repositories/cat-payment-method.repository";
import { ICatPaymentMethodService } from "../../domain/services/cat-payment-method.service";
import { ICreatePaymentMethod } from "../../domain/types/cat-payment-method.type";
import SymbolsCatalogs from "../../symbols-catalogs";


@Injectable()
export class CatPaymentMethodService implements ICatPaymentMethodService {
    constructor(
        @Inject(
            SymbolsCatalogs.ICatPaymentMethodRepository
        ) private readonly catPaymentMethodRepository: ICatPaymentMethodRepository
    ) { }

    async create(paymentMethod: ICreatePaymentMethod): Promise<CatPaymentMethodModel> {
        const catPaymentMethodModel = CatPaymentMethodModel.create(paymentMethod);
        return await this.catPaymentMethodRepository.create(catPaymentMethodModel);
    }

    async findAll(): Promise<CatPaymentMethodModel[]> {
        return await this.catPaymentMethodRepository.findAll()
    }

    async findById(id: string): Promise<CatPaymentMethodModel> {
        const paymentMethod = await this.catPaymentMethodRepository.findById(id)

        if (!paymentMethod) throw new BaseErrorException('Payment Method not found', HttpStatus.BAD_REQUEST)

        return paymentMethod
    }
}