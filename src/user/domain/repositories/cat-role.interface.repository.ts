import { CatRoleModel } from "../../../core/domain/models/cat-role.model";

export interface ICatRoleRepository {
    findByName(name: string): Promise<CatRoleModel | null>
    findByIds(ids: string[]): Promise<CatRoleModel[]>
}
