/**
 * Narrow outbound port to the payment-method catalogue, used only to put a name on
 * each breakdown bucket. Bound to `SymbolsCatalogs.ICatPaymentMethodRepository`
 * inside AnalyticsModule only.
 */
export interface ICatPaymentMethodRepository {
    /** The whole catalogue: a handful of rows, cheaper than a $lookup per report. */
    findAllNames(): Promise<{ _id: string; name: string }[]>;
}
