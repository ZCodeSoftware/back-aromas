import { UserModel } from "../../../core/domain/models/user.model";
import { ICreateUser, IUpdateUser } from "../types/user.type";

export interface IUserService {
    create(user: ICreateUser): Promise<UserModel>;
    findById(id: string): Promise<UserModel>;
    findAll(): Promise<UserModel[]>;
    update(id: string, user: IUpdateUser): Promise<UserModel>;
    delete(id: string): Promise<UserModel>;
}
