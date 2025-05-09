import { CatRoleModel } from "../models/cat-role.model";

export interface ICatRoleRepository {
    findByName(name: string): Promise<CatRoleModel | null>
}
