import { HttpStatus, Inject, Injectable } from "@nestjs/common";
import SymbolsCatalogs from "../../../catalogs/symbols-catalogs";
import { TypeRoles } from "../../../core/domain/enums/type-roles.enum";
import { BaseErrorException } from "../../../core/domain/exceptions/base.error.exception";
import { UserModel } from "../../../core/domain/models/user.model";
import { IUserRepository } from "../../../core/domain/repositories/user.interface.repository";
import { ICatRoleRepository } from "../../domain/repositories/cat-role.interface.repository";
import { IUserService } from "../../domain/services/user.interface.service";
import { ICreateUser, IUpdateUser } from "../../domain/types/user.type";
import SymbolsUser from "../../symbols-user";

@Injectable()
export class UserService implements IUserService {
    constructor(
        @Inject(SymbolsUser.IUserRepository)
        private readonly userRepository: IUserRepository,
        @Inject(SymbolsCatalogs.ICatRoleRepository)
        private readonly catRoleRepository: ICatRoleRepository
    ) { }

    async create(user: ICreateUser): Promise<UserModel> {
        const existingUser = await this.userRepository.findByEmail(user.email);
        if (existingUser) {
            throw new BaseErrorException("User shouldn't be created", HttpStatus.BAD_REQUEST);
        }
        const userRole = await this.catRoleRepository.findByName(TypeRoles.USER);
        if (!userRole) {
            throw new BaseErrorException("Role not found", HttpStatus.NOT_FOUND);
        }
        const hashedPassword = await UserModel.hashPassword(user.password);
        const userModel = UserModel.create({ ...user, password: hashedPassword });

        userModel.addRole(userRole);

        return this.userRepository.create(userModel);
    }

    async findById(id: string): Promise<UserModel> {
        return this.userRepository.findById(id);
    }

    async findAll(): Promise<UserModel[]> {
        return this.userRepository.findAll();
    }

    async update(id: string, user: IUpdateUser): Promise<UserModel> {
        if (user.email) {
            const existingUser = await this.userRepository.findByEmail(user.email);
            if (existingUser && String(existingUser.toJSON()._id) !== String(id)) {
                throw new BaseErrorException('Email already in use', HttpStatus.BAD_REQUEST);
            }
        }

        const userModel = UserModel.create({ ...user, _id: id });

        if (user.roles) {
            const roles = await this.catRoleRepository.findByIds(user.roles);
            if (roles.length !== user.roles.length) {
                throw new BaseErrorException('One or more roles not found', HttpStatus.NOT_FOUND);
            }
            userModel.setRoles(roles);
        }

        return this.userRepository.update(userModel);
    }

    async delete(id: string): Promise<UserModel> {
        return this.userRepository.softDelete(id);
    }
}
