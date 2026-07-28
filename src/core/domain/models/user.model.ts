import { HttpStatus } from '@nestjs/common';
import { BaseErrorException } from '../exceptions/base.error.exception';
import { hashPassword } from '../utils/bcrypt.util';
import { Identifier } from '../value-objects/identifier';
import { BaseModel } from './base.model';
import { CatRoleModel } from './cat-role.model';

/**
 * Canonical user aggregate. Every module resolves `SymbolsUser.IUserRepository`
 * to the single implementation in `src/user`, so this is the only UserModel.
 *
 * `_address` is kept as plain objects instead of a nested AddressModel: the
 * address aggregate lives in its own module and a nominal type there would make
 * this model unusable from cart/order/review.
 */
export class UserModel extends BaseModel {
  private _email: string;
  private _password: string;
  private _firstName: string;
  private _lastName: string;
  private _isActive: boolean;
  private _phone: string;
  private _newsletter: boolean;
  private _roles: CatRoleModel[];
  private _address: any[];

  static async hashPassword(password: string): Promise<string> {
    const hashedPassword = await hashPassword(password);
    if (!hashedPassword) {
      throw new BaseErrorException('Error hashing password', HttpStatus.INTERNAL_SERVER_ERROR);
    }
    return hashedPassword;
  }

  /** Accepts a domain model, a mongoose document or a plain object. */
  private static plainRelation(value: any): any {
    if (value === null || value === undefined) return value;
    return typeof value.toJSON === 'function' ? value.toJSON() : value;
  }

  private static relationId(value: any): string {
    const plain = UserModel.plainRelation(value);
    return String(plain?._id ?? plain);
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

  addAddress(address: any): void {
    if (!this._address) {
      this._address = [];
    }
    const incoming = UserModel.plainRelation(address);
    const alreadyLinked = this._address.some(
      (addr) => UserModel.relationId(addr) === UserModel.relationId(incoming),
    );
    if (!alreadyLinked) {
      this._address.push(incoming);
    }
  }

  /** True when the given address id belongs to this user. */
  hasAddress(addressId: string): boolean {
    return (this._address ?? []).some((addr) => UserModel.relationId(addr) === String(addressId));
  }

  get infoAuth() {
    return { name: this._firstName, roles: this._roles };
  }

  /** Only the login flow should read this: the hash never leaves the domain otherwise. */
  get passwordHash(): string {
    return this._password;
  }

  /**
   * `toJSON()` is what reaches the HTTP layer, so the password hash is left out of
   * it on purpose. Persistence goes through `toPersistence()` instead.
   */
  public toJSON() {
    const aggregate = this._id ? { _id: this._id.toValue() } : {};
    return {
      ...aggregate,
      email: this._email,
      firstName: this._firstName,
      lastName: this._lastName,
      phone: this._phone,
      isActive: this._isActive,
      newsletter: this._newsletter,
      // undefined rather than [] so a partial update that omits a relation is
      // filtered out by the repository instead of wiping it.
      roles: this._roles ? this._roles.map((role) => role.toJSON()) : undefined,
      address: this._address ?? undefined,
      createdAt: this._createdAt,
      updatedAt: this._updatedAt,
    };
  }

  /** Write shape for the repository: `toJSON()` plus the password hash. */
  public toPersistence() {
    return { ...this.toJSON(), password: this._password };
  }

  static create(user: any): UserModel {
    const newUser = new UserModel(new Identifier(user._id));
    newUser._email = user.email;
    newUser._password = user.password;
    newUser._firstName = user.firstName;
    newUser._lastName = user.lastName;
    newUser._phone = user.phone;
    // Left undefined when absent: the schema default covers inserts, and a partial
    // update must not resurrect a soft-deleted user.
    newUser._isActive = user.isActive;
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
    newUser._roles = user.roles ? user.roles.map((role: any) => CatRoleModel.hydrate(role)) : [];
    newUser._address = user.address ? user.address.map((addr: any) => UserModel.plainRelation(addr)) : [];
    newUser._createdAt = user.createdAt;
    newUser._updatedAt = user.updatedAt;

    return newUser;
  }
}
