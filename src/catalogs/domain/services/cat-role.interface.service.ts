import { CatRoleModel } from "../models/cat-role.model";
import { ICreateRole, IUpdateRole } from "../types/cat-role.type";

export interface ICatRoleService {
    create(catalogs: ICreateRole): Promise<CatRoleModel>;
    findById(id: string): Promise<CatRoleModel>;
    findAll(): Promise<CatRoleModel[]>;
    update(id: string, role: IUpdateRole): Promise<CatRoleModel>;
    delete(id: string): Promise<CatRoleModel>;
}
