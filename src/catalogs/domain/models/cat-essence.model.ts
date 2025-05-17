import { BaseModel } from "../../../core/domain/models/base.model";
import { Identifier } from "../../../core/domain/value-objects/identifier";


export class CatEssenceModel extends BaseModel {
    private _name: string;

    public toJSON() {
        const aggregate = this._id ? { _id: this._id.toValue() } : {};
        return {
            ...aggregate,
            name: this._name,
        };
    }

    static create(essence: any): CatEssenceModel {
        const newEssence = new CatEssenceModel(new Identifier(essence._id));
        newEssence._name = essence.name;

        return newEssence;
    }

    static hydrate(essence: any): CatEssenceModel {
        const newEssence = new CatEssenceModel(new Identifier(essence._id));
        newEssence._name = essence.name;

        return newEssence
    }

}