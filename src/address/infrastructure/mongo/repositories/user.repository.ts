import { HttpStatus, Injectable } from "@nestjs/common";
import { InjectModel } from "@nestjs/mongoose";
import { Model } from "mongoose";
import { BaseErrorException } from "../../../../core/domain/exceptions/base.error.exception";
import { USER_RELATIONS } from "../../../../core/infrastructure/nest/constants/relations.constant";
import { UserModel } from "../../../domain/models/user.model";
import { IUserRepository } from "../../../domain/repositories/user.interface.repository";
import { UserSchema } from "../schemas/user.schema";

@Injectable()
export class UserRepository implements IUserRepository {
    constructor(
        @InjectModel('User') private readonly userDB: Model<UserSchema>
    ) { }

    async update(user: UserModel): Promise<UserModel> {
        const updateObject = user.toJSON();
        const filteredUpdateObject = Object.fromEntries(
            Object.entries(updateObject).filter(([key, value]) => {
                if (USER_RELATIONS.includes(key)) {
                    return (value !== null && value !== undefined && typeof value === 'object');
                }
                return value !== undefined && key !== '_id'
            })
        );

        const updatedUser = await this.userDB.findByIdAndUpdate(
            user.id.toString(),
            filteredUpdateObject,
            { new: true, omitUndefined: true }
        ).populate('address');

        if (!updatedUser) {
            throw new BaseErrorException(
                'Branch cannot be updated',
                HttpStatus.NOT_FOUND
            );
        }

        return UserModel.hydrate(updatedUser);
    }

    async findById(id: string): Promise<UserModel | null> {
        const user = await this.userDB.findById(id).populate('address');
        if (!user) return null;
        return UserModel.hydrate(user);
    }
}
