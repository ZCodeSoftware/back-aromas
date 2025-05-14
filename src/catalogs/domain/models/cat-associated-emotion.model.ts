import { BaseModel } from "../../../core/domain/models/base.model";
import { Identifier } from "../../../core/domain/value-objects/identifier";


export class CatAssociatedEmotionModel extends BaseModel {
    private _name: string;

    public toJSON() {
        const aggregate = this._id ? { _id: this._id.toValue() } : {};
        return {
            ...aggregate,
            name: this._name,
        };
    }

    static create(associatedEmotion: any): CatAssociatedEmotionModel {
        const newAssociatedEmotion = new CatAssociatedEmotionModel(new Identifier(associatedEmotion._id));
        newAssociatedEmotion._name = associatedEmotion.name;

        return newAssociatedEmotion;
    }

    static hydrate(associatedEmotion: any): CatAssociatedEmotionModel {
        const newAssociatedEmotion = new CatAssociatedEmotionModel(new Identifier(associatedEmotion._id));
        newAssociatedEmotion._name = associatedEmotion.name;

        return newAssociatedEmotion
    }

}