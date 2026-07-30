import { HttpStatus, Injectable } from "@nestjs/common";
import { InjectModel } from "@nestjs/mongoose";
import { Model } from "mongoose";
import { BaseErrorException } from "../../../../core/domain/exceptions/base.error.exception";
import { UserModel } from "../../../../core/domain/models/user.model";
import { IUserRepository } from "../../../../core/domain/repositories/user.interface.repository";
import { USER_RELATIONS } from "../../../../core/infrastructure/nest/constants/relations.constant";
import { UserSchema } from "../schemas/user.schema";

/**
 * `address` keeps the ref of soft-deleted addresses (the delete only flips
 * `isActive`), so the populate has to filter them out or every user payload
 * would ship addresses the client already deleted. Its own relations are
 * populated here too, the same way the address repository does it.
 */
const USER_POPULATE = [
    { path: 'roles' },
    { path: 'address', match: { isActive: true }, populate: 'geo typeOfHousing' },
];

@Injectable()
export class UserRepository implements IUserRepository {
    constructor(
        @InjectModel('User') private readonly userDB: Model<UserSchema>
    ) { }

    async create(user: UserModel): Promise<UserModel> {
        const schema = new this.userDB(user.toPersistence());
        const newUser = await schema.save();

        if (!newUser) throw new BaseErrorException(`User shouldn't be created`, HttpStatus.BAD_REQUEST);

        return UserModel.hydrate(newUser);
    }

    async findById(id: string): Promise<UserModel> {
        const user = await this.userDB.findOne({ _id: id, isActive: true }).populate(USER_POPULATE);
        if (!user) throw new BaseErrorException('User not found', HttpStatus.NOT_FOUND);
        return UserModel.hydrate(user);
    }

    /**
     * Deliberately not filtered by isActive: this backs both the login lookup and
     * the registration uniqueness check, and the email of a deactivated user must
     * stay taken. Callers are responsible for rejecting an inactive user.
     */
    async findByEmail(email: string): Promise<UserModel | null> {
        const user = await this.userDB.findOne({ email }).select('+password').populate(USER_POPULATE);
        if (!user) return null;
        return UserModel.hydrate(user);
    }

    async findAll(includeInactive = false): Promise<UserModel[]> {
        const users = await this.userDB.find(includeInactive ? {} : { isActive: true }).populate(USER_POPULATE);
        return users?.map(user => UserModel.hydrate(user));
    }

    async update(user: UserModel): Promise<UserModel> {
        const updateObject = user.toJSON();
        const filteredUpdateObject = Object.fromEntries(
            Object.entries(updateObject).filter(([key, value]) => {
                // _id is never reassigned and the timestamps are managed by mongoose.
                if (key === '_id' || key === 'createdAt' || key === 'updatedAt') return false;
                if (USER_RELATIONS.includes(key)) {
                    return (value !== null && value !== undefined && typeof value === 'object');
                }
                return value !== undefined;
            })
        );

        const updatedUser = await this.userDB.findByIdAndUpdate(
            user.id.toString(),
            filteredUpdateObject,
            { new: true }
        ).populate(USER_POPULATE);

        if (!updatedUser) {
            throw new BaseErrorException('User not found', HttpStatus.NOT_FOUND);
        }

        return UserModel.hydrate(updatedUser);
    }

    async softDelete(id: string): Promise<UserModel> {
        const user = await this.userDB
            .findByIdAndUpdate(id, { isActive: false }, { new: true })
            .populate(USER_POPULATE);

        if (!user) {
            throw new BaseErrorException('User not found', HttpStatus.NOT_FOUND);
        }

        return UserModel.hydrate(user);
    }
}
