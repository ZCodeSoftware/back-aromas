import { SortByFields } from "../enum/sort-by-fields.enum";
import { SortOrder } from "../enum/sort-order.enum";


export interface FilterOptions {
    page?: number;
    limit?: number;
    sortBy?: SortByFields;
    sortOrder?: SortOrder;
    isActive?: boolean;
    search?: string;
    categoryId?: string;
    brandId?: string;
    colorId?: string;
    essenceId?: string;
    associatedEmotionId?: string;
}