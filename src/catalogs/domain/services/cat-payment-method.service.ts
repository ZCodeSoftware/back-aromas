import { CatPaymentMethodModel } from "../models/cat-payment-method.model";
import { ICreatePaymentMethod } from "../types/cat-payment-method.type";



export interface ICatPaymentMethodService {
    create(catalogs: ICreatePaymentMethod): Promise<CatPaymentMethodModel>;
    findById(id: string): Promise<CatPaymentMethodModel>;
    findAll(): Promise<CatPaymentMethodModel[]>;
}