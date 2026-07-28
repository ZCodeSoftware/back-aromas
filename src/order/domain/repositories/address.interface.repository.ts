import { IOrderAddress } from "../types/order.type";

/**
 * Narrow outbound port to the address aggregate. Bound to
 * `SymbolsAddress.IAddressRepository` inside OrderModule only.
 */
export interface IAddressRepository {
    findById(id: string): Promise<IOrderAddress | null>;
}
