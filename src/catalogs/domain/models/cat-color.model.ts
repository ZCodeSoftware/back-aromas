import { BaseModel } from "../../../core/domain/models/base.model";
import { Identifier } from "../../../core/domain/value-objects/identifier";

export class CatColorModel extends BaseModel{
    private _name:string;
    private _hex: string;
    private _isActive: boolean;

    get isActive(): boolean {
        return this._isActive;
    }

    setIsActive(isActive: boolean): void {
        this._isActive = isActive;
    }

    public toJSON(){
        const aggregate = this._id ? {_id: this._id.toValue()}:{};

        return {
            ...aggregate,
            name:this._name,
            hex:this._hex,
            isActive: this._isActive,
        };
    }

    static create (color: any): CatColorModel{
        const newColor= new CatColorModel(new Identifier(color._id));
        newColor._name= color.name;
        newColor._hex= color.hex;
        // Left undefined when absent: the schema default covers inserts, and a partial
        // update must not resurrect a soft-deleted row.
        newColor._isActive = color.isActive;

        return newColor;
    }

    static hydrate (color: any):CatColorModel{
        const newColor = new CatColorModel(new Identifier(color._id))
        newColor._name= color.name;
        newColor._hex= color.hex;
        newColor._isActive = color.isActive;

        return newColor;
    }
}
