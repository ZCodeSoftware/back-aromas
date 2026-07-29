import { BaseModel } from "../../../core/domain/models/base.model";
import { Identifier } from "../../../core/domain/value-objects/identifier";


export class CatOrderStatusModel extends BaseModel {
    private _code: string;
    private _name: string;
    private _sortOrder: number;
    private _isActive: boolean;

    get code(): string {
        return this._code;
    }

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
            code: this._code,
            name: this._name,
            sortOrder: this._sortOrder,
            isActive: this._isActive,
        };
    }

    static create(orderStatus: any): CatOrderStatusModel {
        const newOrderStatus = new CatOrderStatusModel(new Identifier(orderStatus._id));
        // Only set on inserts: an update never rewrites the code, because every
        // order already points at this row and the lifecycle is keyed on it.
        newOrderStatus._code = orderStatus.code;
        newOrderStatus._name = orderStatus.name;
        newOrderStatus._sortOrder = orderStatus.sortOrder;
        // Left undefined when absent: the schema default covers inserts, and a partial
        // update must not resurrect a soft-deleted row.
        newOrderStatus._isActive = orderStatus.isActive;

        return newOrderStatus;
    }

    static hydrate(orderStatus: any): CatOrderStatusModel {
        const newOrderStatus = new CatOrderStatusModel(new Identifier(orderStatus._id));
        newOrderStatus._code = orderStatus.code;
        newOrderStatus._name = orderStatus.name;
        newOrderStatus._sortOrder = orderStatus.sortOrder;
        newOrderStatus._isActive = orderStatus.isActive;

        return newOrderStatus;
    }
}
