import { HttpStatus, Injectable } from "@nestjs/common";
import { InjectModel } from "@nestjs/mongoose";
import { Model } from "mongoose";
import { BaseErrorException } from "../../../../core/domain/exceptions/base.error.exception";
import { PaginatedResponse } from "../../../../core/domain/response/find-all-paginated.response";
import { PRODUCT_RELATIONS } from "../../../../core/infrastructure/nest/constants/relations.constant";
import { SortByFields } from "../../../domain/enum/sort-by-fields.enum";
import { SortOrder } from "../../../domain/enum/sort-order.enum";
import { ProductModel } from "../../../domain/models/product.model";
import { IProductRepository } from "../../../domain/repositories/product.interface.repository";
import { FilterOptionsDTO } from "../../nest/dtos/filter.dto";
import { ProductSchema } from "../schemas/product.schema";

@Injectable()
export class ProductRepository implements IProductRepository {
    constructor(
        @InjectModel('Product') private readonly productDB: Model<ProductSchema>
    ) { }

    async create(product: ProductModel): Promise<ProductModel> {
        const schema = new this.productDB(product.toJSON());
        const newProduct = await schema.save();

        if (!newProduct) throw new BaseErrorException(`Product shouldn't be created`, HttpStatus.BAD_REQUEST);

        return ProductModel.hydrate(newProduct);
    }

    async findById(id: string): Promise<ProductModel> {
        const product = await this.productDB.findById(id).populate({
            path: 'associatedEmotion essence brand color subCategory'
        });
        if (!product) throw new BaseErrorException('Product not found', HttpStatus.NOT_FOUND);
        return ProductModel.hydrate(product);
    }

    async findAll(options: FilterOptionsDTO = {}): Promise<PaginatedResponse<ProductModel>> {
        const {
            page = 1,
            limit = 10,
            sortBy = SortByFields.CREATED_AT,
            sortOrder = SortOrder.DESC,
            isActive,
            search,
            priceMin,
            priceMax,
            hasStock,
            brandId,
            colorId,
            essenceId,
            associatedEmotionId,
            subCategoryId,
            stockMin,
            stockMax
        } = options;

        const currentPage = Math.max(1, page);
        const itemsPerPage = Math.min(Math.max(1, limit), 100);
        const skip = (currentPage - 1) * itemsPerPage;

        const filters: any = {};

        if (isActive !== undefined) {
            filters.is_active = isActive;
        }

        if (search) {
            filters.$or = [
                { name: { $regex: search, $options: 'i' } },
                { description: { $regex: search, $options: 'i' } }
            ];
        }

        if (priceMin !== undefined || priceMax !== undefined) {
            filters.price = {};
            if (priceMin !== undefined) filters.price.$gte = priceMin;
            if (priceMax !== undefined) filters.price.$lte = priceMax;
        }

        if (hasStock !== undefined) {
            if (hasStock) {
                filters.stock = { $gt: 0 };
            } else {
                filters.stock = { $lte: 0 };
            }
        }

        if (stockMin !== undefined || stockMax !== undefined) {
            if (!filters.stock) filters.stock = {};
            if (stockMin !== undefined) filters.stock.$gte = stockMin;
            if (stockMax !== undefined) filters.stock.$lte = stockMax;
        }

        if (brandId) filters.brand = brandId;
        if (colorId) filters.color = colorId;
        if (essenceId) filters.essence = essenceId;
        if (associatedEmotionId) filters.associated_emotion = associatedEmotionId;
        if (subCategoryId) filters.sub_category = subCategoryId;

        const sortObject: any = {};
        sortObject[sortBy] = sortOrder === SortOrder.DESC ? -1 : 1;

        const totalItems = await this.productDB.countDocuments(filters);
        const totalPages = Math.ceil(totalItems / itemsPerPage);

        const products = await this.productDB
            .find(filters)
            .populate('associatedEmotion essence brand color subCategory')
            .populate({ path: 'category', select: 'name _id' })
            .skip(skip)
            .limit(itemsPerPage)
            .sort(sortObject);

        const data = products?.map(product => ProductModel.hydrate(product)) || [];

        return {
            data,
            pagination: {
                currentPage,
                totalPages,
                totalItems,
                itemsPerPage,
                hasNextPage: currentPage < totalPages,
                hasPrevPage: currentPage > 1
            }
        };
    }

    async update(id: string, product: Partial<ProductModel>): Promise<ProductModel> {
        const updateObject = product.toJSON();
        const filteredUpdateObject = Object.fromEntries(
            Object.entries(updateObject).filter(([key, value]) => {
                if (PRODUCT_RELATIONS.includes(key)) {
                    return (value !== null && value !== undefined && typeof value === 'object');
                }
                return value !== null && value !== undefined;
            })
        );
        const productToUpdate = await this.productDB.findByIdAndUpdate(id, filteredUpdateObject, { new: true, omitUndefined: true })
            .populate('associatedEmotion essence brand color subCategory')
            .populate({ path: 'category', select: 'name _id' });

        if (!productToUpdate) throw new BaseErrorException(`Product shouldn't be updated`, HttpStatus.BAD_REQUEST);

        return ProductModel.hydrate(productToUpdate);
    }
}
