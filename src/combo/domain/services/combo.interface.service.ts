import { PaginatedResponse } from "../../../core/domain/response/find-all-paginated.response";
import { ComboModel } from "../models/combo.model";
import { IComboFilterOptions, ICreateCombo } from "../types/combo.type";

export interface IComboService {
    create(combo: ICreateCombo): Promise<ComboModel>;
    findById(id: string): Promise<ComboModel>;
    findAll(options: IComboFilterOptions): Promise<PaginatedResponse<ComboModel>>;
    update(id: string, combo: Partial<ICreateCombo>): Promise<ComboModel>;
    delete(id: string): Promise<ComboModel>;
}
