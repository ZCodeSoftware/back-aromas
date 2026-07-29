import { CatOrderStatusModel } from "../models/cat-order-status.model";


export interface ICatOrderStatusRepository {
    create(orderStatus: CatOrderStatusModel): Promise<CatOrderStatusModel>;
    findById(id: string): Promise<CatOrderStatusModel | null>;
    findByCode(code: string): Promise<CatOrderStatusModel | null>;
    findAll(): Promise<CatOrderStatusModel[]>;
    update(id: string, orderStatus: CatOrderStatusModel): Promise<CatOrderStatusModel>;
}
