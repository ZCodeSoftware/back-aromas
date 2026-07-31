import { PaginatedResponse } from "../../../core/domain/response/find-all-paginated.response";
import { IPricingResult } from "../../../promotion/domain/types/pricing.type";
import { OrderStatus } from "../enum/order-status.enum";
import { OrderModel } from "../models/order.model";
import { ICreateOrder, IOrderFilterOptions, IPreviewOrder } from "../types/order.type";

export interface IOrderService {
    /** Turns the user's cart into an order: snapshots it, takes stock, empties the cart. */
    create(userId: string, order: ICreateOrder): Promise<OrderModel>;
    /** Prices the cart without writing anything, so the checkout can show a total. */
    preview(userId: string, options: IPreviewOrder): Promise<IPricingResult>;
    /** Owner-or-admin check happens here, not in a guard. */
    findById(id: string, requesterId: string): Promise<OrderModel>;
    findByUser(userId: string, options: IOrderFilterOptions): Promise<PaginatedResponse<OrderModel>>;
    findAll(options: IOrderFilterOptions): Promise<PaginatedResponse<OrderModel>>;
    changeStatus(id: string, status: OrderStatus): Promise<OrderModel>;
    cancel(id: string, requesterId: string): Promise<OrderModel>;
}
