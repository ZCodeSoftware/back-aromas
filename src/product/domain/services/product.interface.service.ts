import { PaginatedResponse } from "../../../core/domain/response/find-all-paginated.response";
import { ProductModel } from "../models/product.model";
import { FilterOptions } from "../types/filter.type";
import { ICreateProduct } from "../types/product.type";

export interface IProductService {
    create(product: ICreateProduct): Promise<ProductModel>;
    findById(id: string): Promise<ProductModel>;
    findAll(options: FilterOptions): Promise<PaginatedResponse<ProductModel>>
    update(id: string, product: Partial<ICreateProduct>): Promise<ProductModel>;
}
