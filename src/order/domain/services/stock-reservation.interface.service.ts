import { OrderModel } from "../models/order.model";
import { IStockLine, IStockReservation } from "../types/order.type";

/**
 * Owns every stock movement of the order context. Extracted from OrderService so
 * that the online checkout and the point of sale share one implementation: there
 * are no transactions to fall back on, so two drifting copies of the
 * take-then-compensate logic would silently corrupt stock.
 */
export interface IStockReservationService {
    /**
     * Takes stock line by line with a guarded update. If one line loses a race,
     * everything already taken is given back and the call throws, so a sale never
     * half-commits.
     */
    reserve(lines: IStockLine[]): Promise<IStockReservation[]>;
    /** Best-effort give-back; a failure is logged, never thrown. */
    release(reserved: IStockReservation[]): Promise<void>;
    /** Idempotent: an order whose stock was already given back is left alone. */
    restoreOnce(order: OrderModel): Promise<void>;
}
