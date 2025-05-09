import { UserModel } from "../models/user.model";

export interface IUserRepository {
    create(user: UserModel): Promise<UserModel>;
    findById(id: string): Promise<UserModel>;
    findByEmail(email: string): Promise<UserModel>
    findAll(): Promise<UserModel[]>;
}
