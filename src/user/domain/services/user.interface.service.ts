import { UserModel } from "../models/user.model";
import { ICreateUser } from "../types/user.type";

export interface IUserService {
    create(user: ICreateUser): Promise<UserModel>;
    findById(id: string): Promise<UserModel>;
    findAll(): Promise<UserModel[]>;
}
