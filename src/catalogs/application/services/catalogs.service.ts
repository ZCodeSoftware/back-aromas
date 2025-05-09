import { HttpStatus, Inject, Injectable } from "@nestjs/common";
import { BaseErrorException } from "../../../core/domain/exceptions/base.error.exception";
import { CatRoleModel } from "../../domain/models/cat-role.model";
import { ICatRoleRepository } from "../../domain/repositories/cat-role.interface.repository";
import { ICatRoleService } from "../../domain/services/cat-role.interface.service";
import { ICreateRole } from "../../domain/types/cat-role.type";
import SymbolsCatalogs from "../../symbols-catalogs";

@Injectable()
export class CatRoleService implements ICatRoleService {
    constructor(
        @Inject(SymbolsCatalogs.ICatRoleRepository)
        private readonly catRoleRepository: ICatRoleRepository
    ) { }

    async create(role: ICreateRole): Promise<CatRoleModel> {
        const catRoleModel = CatRoleModel.create(role);
        return this.catRoleRepository.create(catRoleModel);
    }

    async findById(id: string): Promise<CatRoleModel> {
        const role = await this.catRoleRepository.findById(id);
        if (!role) {
            throw new BaseErrorException("Role not found", HttpStatus.NOT_FOUND);
        }
        return this.catRoleRepository.findById(id);
    }

    async findAll(): Promise<CatRoleModel[]> {
        return this.catRoleRepository.findAll();
    }
}
