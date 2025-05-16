import { CatPaymentMethodModel } from "../models/cat-payment-method.model";


export interface ICatPaymentMethodRepository {
    create(PaymentMethod: CatPaymentMethodModel): Promise<CatPaymentMethodModel>;
    findById(id: string): Promise<CatPaymentMethodModel | null>;
    findAll(): Promise<CatPaymentMethodModel[]>
}