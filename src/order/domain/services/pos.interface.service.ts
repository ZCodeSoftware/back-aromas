import { PaginatedResponse } from "../../../core/domain/response/find-all-paginated.response";
import { IPricingResult } from "../../../promotion/domain/types/pricing.type";
import { OrderModel } from "../models/order.model";
import { ICreatePosSale, IOrderFilterOptions, IPreviewPosSale } from "../types/order.type";

/**
 * Counter sales. A point-of-sale order is an Order like any other, only it is
 * born PAID because the money is taken before the customer leaves, and it never
 * goes near a cart.
 */
export interface IPosService {
    /** Registers a paid counter sale and takes the stock. `soldBy` is the operator. */
    createSale(soldBy: string, sale: ICreatePosSale): Promise<OrderModel>;
    /** Prices a sale without writing anything, so the operator can quote the total. */
    preview(sale: IPreviewPosSale): Promise<IPricingResult>;
    /** Moves a POS sale to REFUNDED and gives the units back. Idempotent. */
    refund(id: string): Promise<OrderModel>;
    /** Always scoped to the POS channel, whatever the caller asks for. */
    findAll(options: IOrderFilterOptions): Promise<PaginatedResponse<OrderModel>>;
}
