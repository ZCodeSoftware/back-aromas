import { BaseModel } from "../../../core/domain/models/base.model";
import { Identifier } from "../../../core/domain/value-objects/identifier";



export class CatPaymentMethodModel extends BaseModel {
    private _name: string;
    private _isActive: boolean;

    get isActive(): boolean {
        return this._isActive;
    }

    setIsActive(isActive: boolean): void {
        this._isActive = isActive;
    }

    public toJSON() {
        const aggregate = this._id ? { _id: this._id.toValue() } : {};
        return {
            ...aggregate,
            name: this._name,
            isActive: this._isActive,
        };
    }

    static create(paymentMethod: any): CatPaymentMethodModel {
        const newPaymentMethod = new CatPaymentMethodModel(new Identifier(paymentMethod._id));
        newPaymentMethod._name = paymentMethod.name;
        // Left undefined when absent: the schema default covers inserts, and a partial
        // update must not resurrect a soft-deleted row.
        newPaymentMethod._isActive = paymentMethod.isActive;

        return newPaymentMethod;
    }

    static hydrate(paymentMethod: any): CatPaymentMethodModel {
        const newPaymentMethod = new CatPaymentMethodModel(new Identifier(paymentMethod._id));
        newPaymentMethod._name = paymentMethod.name;
        newPaymentMethod._isActive = paymentMethod.isActive;

        return newPaymentMethod
    }

}
