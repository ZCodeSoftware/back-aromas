import { CatOrderStatusModel } from "../models/cat-order-status.model";
import { ICreateOrderStatus, IUpdateOrderStatus } from "../types/cat-order-status.type";


export interface ICatOrderStatusService {
    create(orderStatus: ICreateOrderStatus): Promise<CatOrderStatusModel>;
    findById(id: string): Promise<CatOrderStatusModel>;
    findAll(): Promise<CatOrderStatusModel[]>;
    update(id: string, orderStatus: IUpdateOrderStatus): Promise<CatOrderStatusModel>;
}
