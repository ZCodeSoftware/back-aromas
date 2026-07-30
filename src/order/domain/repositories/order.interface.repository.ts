import { PaginatedResponse } from "../../../core/domain/response/find-all-paginated.response";
import { OrderModel } from "../models/order.model";
import { IOrderFilterOptions } from "../types/order.type";

export interface IOrderRepository {
    create(order: OrderModel): Promise<OrderModel>;
    /** Throws NOT_FOUND when the order does not exist. */
    findById(id: string): Promise<OrderModel>;
    findAll(options: IOrderFilterOptions): Promise<PaginatedResponse<OrderModel>>;
    update(id: string, order: OrderModel): Promise<OrderModel>;
    /** True when the user has a completed purchase containing that product. */
    hasPurchasedProduct(userId: string, productId: string): Promise<boolean>;
}
