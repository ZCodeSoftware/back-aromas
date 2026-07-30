import { BaseModel } from "../../../core/domain/models/base.model";
import { Identifier } from "../../../core/domain/value-objects/identifier";


export class CatEssenceModel extends BaseModel {
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

    static create(essence: any): CatEssenceModel {
        const newEssence = new CatEssenceModel(new Identifier(essence._id));
        newEssence._name = essence.name;
        // Left undefined when absent: the schema default covers inserts, and a partial
        // update must not resurrect a soft-deleted row.
        newEssence._isActive = essence.isActive;

        return newEssence;
    }

    static hydrate(essence: any): CatEssenceModel {
        const newEssence = new CatEssenceModel(new Identifier(essence._id));
        newEssence._name = essence.name;
        newEssence._isActive = essence.isActive;

        return newEssence
    }

}
