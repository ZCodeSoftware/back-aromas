import { HttpStatus, Inject, Injectable } from "@nestjs/common";
import SymbolsCatalogs from "../../../catalogs/symbols-catalogs";
import { TypeRoles } from "../../../core/domain/enums/type-roles.enum";
import { BaseErrorException } from "../../../core/domain/exceptions/base.error.exception";
import { UserModel } from "../../domain/models/user.model";
import { ICatRoleRepository } from "../../domain/repositories/cat-role.interface.repository";
import { IUserRepository } from "../../domain/repositories/user.interface.repository";
import { IUserService } from "../../domain/services/user.interface.service";
import { ICreateUser } from "../../domain/types/user.type";
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
}
