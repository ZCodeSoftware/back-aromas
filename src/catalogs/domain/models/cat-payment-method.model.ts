import { BaseModel } from "../../../core/domain/models/base.model";
import { Identifier } from "../../../core/domain/value-objects/identifier";



export class CatPaymentMethodModel extends BaseModel {
    private _name: string;

    public toJSON() {
        const aggregate = this._id ? { _id: this._id.toValue() } : {};
        return {
            ...aggregate,
            name: this._name,
        };
    }

    static create(paymentMethod: any): CatPaymentMethodModel {
        const newPaymentMethod = new CatPaymentMethodModel(new Identifier(paymentMethod._id));
        newPaymentMethod._name = paymentMethod.name;

        return newPaymentMethod;
    }

    static hydrate(paymentMethod: any): CatPaymentMethodModel {
        const newPaymentMethod = new CatPaymentMethodModel(new Identifier(paymentMethod._id));
        newPaymentMethod._name = paymentMethod.name;

        return newPaymentMethod
    }

}