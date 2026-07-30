import { BaseModel } from '../../../core/domain/models/base.model';
import { Identifier } from '../../../core/domain/value-objects/identifier';

export class CatRoleModel extends BaseModel {
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

  static create(role: any): CatRoleModel {
    const newRole = new CatRoleModel(new Identifier(role._id));
    newRole._name = role.name;
    // Left undefined when absent: the schema default covers inserts, and a partial
    // update must not resurrect a soft-deleted row.
    newRole._isActive = role.isActive;

    return newRole;
  }

  static hydrate(role: any): CatRoleModel {
    const newRole = new CatRoleModel(new Identifier(role._id));
    newRole._name = role.name;
    newRole._isActive = role.isActive;

    return newRole;
  }
}
