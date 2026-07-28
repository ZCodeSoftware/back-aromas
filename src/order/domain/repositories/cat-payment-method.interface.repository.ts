/**
 * Narrow outbound port to the payment-method catalogue. Bound to
 * `SymbolsCatalogs.ICatPaymentMethodRepository` inside OrderModule only.
 */
export interface ICatPaymentMethodRepository {
    findById(id: string): Promise<{ _id: string; name: string } | null>;
}
