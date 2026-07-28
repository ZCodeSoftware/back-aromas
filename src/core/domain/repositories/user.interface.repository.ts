import { UserModel } from "../models/user.model";

export interface IUserRepository {
    create(user: UserModel): Promise<UserModel>;
    /** Throws NOT_FOUND when the user does not exist. */
    findById(id: string): Promise<UserModel>;
    /** Returns null when there is no match, so callers can check availability. */
    findByEmail(email: string): Promise<UserModel | null>;
    findAll(): Promise<UserModel[]>;
    update(user: UserModel): Promise<UserModel>;
    /** Soft delete: flips isActive to false, the row is kept. */
    softDelete(id: string): Promise<UserModel>;
}
