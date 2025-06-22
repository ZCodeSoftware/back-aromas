import { Inject, Injectable } from "@nestjs/common";
import SymbolsCatalogs from "../../../catalogs/symbols-catalogs";
import { PaginatedResponse } from "../../../core/domain/response/find-all-paginated.response";
import { ProductModel } from "../../domain/models/product.model";
import { ICatAssociatedEmotionRepository } from "../../domain/repositories/cat-associated-emotion.repository";
import { ICatBrandRepository } from "../../domain/repositories/cat-brand.repository";
import { ICatColorRepository } from "../../domain/repositories/cat-color.interface.repository";
import { ICatEssenceRepository } from "../../domain/repositories/cat-essence.repository";
import { ICatSubCategoryRepository } from "../../domain/repositories/cat-sub-cartegory.repository";
import { IProductRepository } from "../../domain/repositories/product.interface.repository";
import { IProductService } from "../../domain/services/product.interface.service";
import { FilterOptions } from "../../domain/types/filter.type";
import { ICreateProduct } from "../../domain/types/product.type";
import SymbolsProduct from "../../symbols-product";

@Injectable()
export class ProductService implements IProductService {
    constructor(
        @Inject(SymbolsProduct.IProductRepository)
        private readonly productRepository: IProductRepository,
        @Inject(SymbolsCatalogs.ICatAssociatedEmotionRepository)
        private readonly catAssociatedEmotionRepository: ICatAssociatedEmotionRepository,
        @Inject(SymbolsCatalogs.ICatEssenceRepository)
        private readonly catEssenceRepository: ICatEssenceRepository,
        @Inject(SymbolsCatalogs.ICatBrandRepository)
        private readonly catBrandRepository: ICatBrandRepository,
        @Inject(SymbolsCatalogs.ICatSubCategoryRepository)
        private readonly catSubCategoryRepository: ICatSubCategoryRepository,
        @Inject(SymbolsCatalogs.ICatColorRepository)
        private readonly catColorRepository: ICatColorRepository,
    ) { }

    async create(product: ICreateProduct): Promise<ProductModel> {
        const { associatedEmotion, essence, brand, subCategory, color, ...rest } = product;
        const productModel = ProductModel.create(rest);

        if (associatedEmotion) {
            const associatedEmotionModel = await this.catAssociatedEmotionRepository.findById(associatedEmotion);
            if (associatedEmotionModel) {
                productModel.addAssociatedEmotion(associatedEmotionModel);
            }
        }

        if (essence) {
            const essenceModel = await this.catEssenceRepository.findById(essence);
            if (essenceModel) {
                productModel.addEssence(essenceModel);
            }
        }

        if (brand) {
            const brandModel = await this.catBrandRepository.findById(brand);
            if (brandModel) {
                productModel.addBrand(brandModel);
            }
        }

        if (subCategory) {
            const subCategoryModel = await this.catSubCategoryRepository.findById(subCategory);
            if (subCategoryModel) {
                productModel.addSubCategory(subCategoryModel);
            }
        }

        if (color) {
            const colorModel = await this.catColorRepository.findById(color);
            if (colorModel) {
                productModel.addColor(colorModel);
            }
        }

        return this.productRepository.create(productModel);
    }

    async findById(id: string): Promise<ProductModel> {
        return this.productRepository.findById(id);
    }

    async findAll(options: FilterOptions): Promise<PaginatedResponse<ProductModel>> {
        return this.productRepository.findAll(options);
    }
}
