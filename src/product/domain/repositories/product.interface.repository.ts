import { PaginatedResponse } from "../../../core/domain/response/find-all-paginated.response";
import { FilterOptionsDTO } from "../../infrastructure/nest/dtos/filter.dto";
import { ProductModel } from "../models/product.model";

export interface IProductRepository {
    create(product: ProductModel): Promise<ProductModel>;
    findById(id: string): Promise<ProductModel>;
    findAll(options: FilterOptionsDTO): Promise<PaginatedResponse<ProductModel>>
}
