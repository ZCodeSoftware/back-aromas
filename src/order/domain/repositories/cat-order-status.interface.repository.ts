import { Types } from "mongoose";
import { OrderStatus } from "../enum/order-status.enum";
import { IOrderStatusRef } from "../types/order.type";

/**
 * Narrow outbound port to the order-status catalogue. Bound to
 * `SymbolsCatalogs.ICatOrderStatusRepository` inside OrderModule only.
 */
export interface ICatOrderStatusRepository {
    findByCode(code: OrderStatus): Promise<IOrderStatusRef | null>;
    /** Ids for a `$in` match, so a status filter still hits the index. */
    idsByCodes(codes: OrderStatus[]): Promise<Types.ObjectId[]>;
}
