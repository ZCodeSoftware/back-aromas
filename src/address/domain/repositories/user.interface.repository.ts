import { UserModel } from "../models/user.model";

export interface IUserRepository {
    update(user: UserModel): Promise<UserModel>;
    findById(id: string): Promise<UserModel>;
}
