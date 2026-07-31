import { PaginatedResponse } from "../../../core/domain/response/find-all-paginated.response";
import { ComboModel } from "../models/combo.model";
import { IComboFilterOptions } from "../types/combo.type";

export interface IComboRepository {
    create(combo: ComboModel): Promise<ComboModel>;
    /** Components come back populated: without them there is no price and no stock. */
    findById(id: string): Promise<ComboModel>;
    findAll(options: IComboFilterOptions): Promise<PaginatedResponse<ComboModel>>;
    update(id: string, combo: ComboModel): Promise<ComboModel>;
    /** Soft delete: flips isActive to false, the row is kept. */
    softDelete(id: string): Promise<ComboModel>;
}
