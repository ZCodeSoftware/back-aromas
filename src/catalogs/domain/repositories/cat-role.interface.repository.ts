import { CatRoleModel } from "../models/cat-role.model";

export interface ICatRoleRepository {
    create(role: CatRoleModel): Promise<CatRoleModel>;
    findById(id: string): Promise<CatRoleModel | null>
    findAll(): Promise<CatRoleModel[]>;
}
