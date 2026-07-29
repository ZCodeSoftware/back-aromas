import { OrderStatus } from "../../../core/domain/enums/order-status.enum";

export interface ICreateOrderStatus {
    code: OrderStatus;
    name: string;
    sortOrder?: number;
};

/** `code` is absent on purpose: renaming a label is safe, rekeying a row is not. */
export interface IUpdateOrderStatus {
    name?: string;
    sortOrder?: number;
};
