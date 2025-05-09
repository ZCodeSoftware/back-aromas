import { Injectable } from "@nestjs/common";
import { InjectModel } from "@nestjs/mongoose";
import { Model } from "mongoose";
import { CatRoleModel } from "../../../domain/models/cat-role.model";
import { ICatRoleRepository } from "../../../domain/repositories/cat-role.interface.repository";
import { CatRoleSchema } from "../schemas/cat-role.schema";

@Injectable()
export class CatRoleRepository implements ICatRoleRepository {
    constructor(
        @InjectModel('CatRole') private readonly catRoleDB: Model<CatRoleSchema>
    ) { }

    async findByName(name: string): Promise<CatRoleModel | null> {
        const role = await this.catRoleDB.findOne({ name });
        if (!role) return null;
        return CatRoleModel.hydrate(role);
    }
}