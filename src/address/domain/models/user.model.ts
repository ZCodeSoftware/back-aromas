import { BaseModel } from '../../../core/domain/models/base.model';
import { Identifier } from '../../../core/domain/value-objects/identifier';
import { AddressModel } from './address.model';

export class UserModel extends BaseModel {
  private _email: string;
  private _password: string;
  private _firstName: string;
  private _lastName: string;
  private _isActive: boolean;
  private _phone: string;
  private _newsletter: boolean;
  private _address?: AddressModel[];

  addAddress(address: AddressModel): void {
    if (!this._address) {
      this._address = [];
    }
    const existingAddress = this._address.find((addr) => addr.toJSON()._id === address.toJSON()._id);
    if (!existingAddress) {
      this._address.push(address);
    }
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
      address: this._address ? this._address.map((addr) => addr.toJSON()) : [],
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
    if (user.address) {
      newUser._address = user.address.map((addr: any) => AddressModel.hydrate(addr));
    }
    newUser._createdAt = user.createdAt;
    newUser._updatedAt = user.updatedAt;

    return newUser;
  }
}
