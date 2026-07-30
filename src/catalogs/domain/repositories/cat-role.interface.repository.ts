import { CatRoleModel } from "../models/cat-role.model";

export interface ICatRoleRepository {
    create(role: CatRoleModel): Promise<CatRoleModel>;
    findById(id: string): Promise<CatRoleModel | null>
    findAll(includeInactive?: boolean): Promise<CatRoleModel[]>;
    update(id: string, role: CatRoleModel): Promise<CatRoleModel>;
    softDelete(id: string): Promise<CatRoleModel>;
}
