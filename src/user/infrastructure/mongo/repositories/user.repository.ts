import { HttpStatus, Injectable } from "@nestjs/common";
import { InjectModel } from "@nestjs/mongoose";
import { Model } from "mongoose";
import { BaseErrorException } from "../../../../core/domain/exceptions/base.error.exception";
import { UserModel } from "../../../domain/models/user.model";
import { IUserRepository } from "../../../domain/repositories/user.interface.repository";
import { UserSchema } from "../schemas/user.schema";

@Injectable()
export class UserRepository implements IUserRepository {
    constructor(
        @InjectModel('User') private readonly userDB: Model<UserSchema>
    ) { }

    async create(user: UserModel): Promise<UserModel> {
        const schema = new this.userDB(user.toJSON());
        const newUser = await schema.save();

        if (!newUser) throw new BaseErrorException(`User shouldn't be created`, HttpStatus.BAD_REQUEST);

        return UserModel.hydrate(newUser);
    }

    async findById(id: string): Promise<UserModel> {
        const user = await this.userDB.findById(id).populate('roles');
        if (!user) throw new BaseErrorException('User not found', HttpStatus.NOT_FOUND);
        return UserModel.hydrate(user);
    }

    async findByEmail(email: string): Promise<UserModel> {
        const user = await this.userDB.findOne({ email }).populate('roles');
        if (!user) return null;
        return UserModel.hydrate(user);
    }

    async findAll(): Promise<UserModel[]> {
        const users = await this.userDB.find().populate('roles');
        return users?.map(user => UserModel.hydrate(user));
    }
}
