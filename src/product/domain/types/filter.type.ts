import { SortByFields } from "../enum/sort-by-fields.enum";
import { SortOrder } from "../enum/sort-order.enum";


export interface FilterOptions {
    page?: number;
    limit?: number;
    sortBy?: SortByFields;
    sortOrder?: SortOrder;
    isActive?: boolean;
    /**
     * Lists soft-deleted products alongside the active ones. Not part of the public
     * query DTO: only the admin listing sets it, so the storefront cannot ask for it.
     */
    includeInactive?: boolean;
    search?: string;
    priceMin?: number;
    priceMax?: number;
    hasStock?: boolean;
    stockMin?: number;
    stockMax?: number;
    categoryId?: string[];
    subCategoryId?: string[];
    brandId?: string[];
    colorId?: string[];
    essenceId?: string[];
    associatedEmotionId?: string[];
}