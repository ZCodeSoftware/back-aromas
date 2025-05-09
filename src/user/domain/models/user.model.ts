import { HttpStatus } from '@nestjs/common';
import { BaseErrorException } from '../../../core/domain/exceptions/base.error.exception';
import { BaseModel } from '../../../core/domain/models/base.model';
import { hashPassword } from '../../../core/domain/utils/bcrypt.util';
import { Identifier } from '../../../core/domain/value-objects/identifier';
import { CatRoleModel } from './cat-role.model';

export class UserModel extends BaseModel {
  private _email: string;
  private _password: string;
  private _firstName: string;
  private _lastName: string;
  private _isActive: boolean;
  private _phone: string;
  private _newsletter: boolean;
  private _roles: CatRoleModel[];

  static async hashPassword(password: string): Promise<string> {
    const hashedPassword = await hashPassword(password);
    if (!hashedPassword) {
      throw new BaseErrorException('Error hashing password', HttpStatus.INTERNAL_SERVER_ERROR);
    }
    return hashedPassword;
  }

  addRole(role: CatRoleModel): void {
    if (!this._roles) {
      this._roles = [];
    }
    const existingRole = this._roles.find((r) => r.toJSON()._id === role.toJSON()._id);
    if (existingRole) {
      throw new BaseErrorException('Role already exists', HttpStatus.BAD_REQUEST);
    }
    this._roles.push(role);
  }

  public toJSON() {
    const aggregate = this._id ? { _id: this._id.toValue() } : {};
    return {
      ...aggregate,
      email: this._email,
      password: this._password,
      firstName: this._firstName,
      lastName: this._lastName,
      phone: this._phone,
      isActive: this._isActive,
      newsletter: this._newsletter,
      roles: this._roles ? this._roles.map((role) => role.toJSON()) : [],
      createdAt: this._createdAt,
      updatedAt: this._updatedAt,
    };
  }

  static create(user: any): UserModel {
    const newUser = new UserModel(new Identifier(user._id));
    newUser._email = user.email;
    newUser._password = user.password;
    newUser._firstName = user.firstName;
    newUser._lastName = user.lastName;
    newUser._phone = user.phone;
    newUser._isActive = true;
    newUser._newsletter = user.newsletter;

    return newUser;
  }

  static hydrate(user: any): UserModel {
    const newUser = new UserModel(new Identifier(user._id));
    newUser._email = user.email;
    newUser._password = user.password;
    newUser._firstName = user.firstName;
    newUser._lastName = user.lastName;
    newUser._phone = user.phone;
    newUser._isActive = user.isActive;
    newUser._newsletter = user.newsletter;
    newUser._roles = user.roles ? user.roles.map((role: CatRoleModel) => CatRoleModel.hydrate(role)) : [];
    newUser._createdAt = user.createdAt;
    newUser._updatedAt = user.updatedAt;

    return newUser;
  }
}
