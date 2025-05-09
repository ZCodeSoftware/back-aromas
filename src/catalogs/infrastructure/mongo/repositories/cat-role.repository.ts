import { HttpStatus, Injectable } from "@nestjs/common";
import { InjectModel } from "@nestjs/mongoose";
import { Model } from "mongoose";
import { BaseErrorException } from "../../../../core/domain/exceptions/base.error.exception";
import { CatRoleModel } from "../../../domain/models/cat-role.model";
import { ICatRoleRepository } from "../../../domain/repositories/cat-role.interface.repository";
import { CatRoleSchema } from "../schemas/cat-role.schema";

@Injectable()
export class CatRoleRepository implements ICatRoleRepository {
    constructor(
        @InjectModel('CatRole') private readonly catRoleDB: Model<CatRoleSchema>
    ) { }

    async create(catRole: CatRoleModel): Promise<CatRoleModel> {
        const schema = new this.catRoleDB(catRole.toJSON());
        const newCatRole = await schema.save();

        if (!newCatRole) throw new BaseErrorException(`Role shouldn't be created`, HttpStatus.BAD_REQUEST);

        return CatRoleModel.hydrate(newCatRole);
    }

    async findById(id: string): Promise<CatRoleModel | null> {
        const role = await this.catRoleDB.findById(id);
        if (!role) return null;
        return CatRoleModel.hydrate(role);
    }

    async findAll(): Promise<CatRoleModel[]> {
        const roles = await this.catRoleDB.find();
        return roles?.map(role => CatRoleModel.hydrate(role));
    }
}
