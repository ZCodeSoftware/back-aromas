import { CatPaymentMethodModel } from "../models/cat-payment-method.model";
import { ICreatePaymentMethod, IUpdatePaymentMethod } from "../types/cat-payment-method.type";



export interface ICatPaymentMethodService {
    create(catalogs: ICreatePaymentMethod): Promise<CatPaymentMethodModel>;
    findById(id: string): Promise<CatPaymentMethodModel>;
    findAll(includeInactive?: boolean): Promise<CatPaymentMethodModel[]>;
    update(id: string, paymentMethod: IUpdatePaymentMethod): Promise<CatPaymentMethodModel>;
    delete(id: string): Promise<CatPaymentMethodModel>;
}