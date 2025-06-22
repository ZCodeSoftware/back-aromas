import { HttpStatus, Inject, Injectable } from "@nestjs/common";
import SymbolsCatalogs from "../../../catalogs/symbols-catalogs";
import { BaseErrorException } from "../../../core/domain/exceptions/base.error.exception";
import { PaginatedResponse } from "../../../core/domain/response/find-all-paginated.response";
import { ProductModel } from "../../domain/models/product.model";
import { ICatAssociatedEmotionRepository } from "../../domain/repositories/cat-associated-emotion.repository";
import { ICatBrandRepository } from "../../domain/repositories/cat-brand.repository";
import { ICatCategoryRepository } from "../../domain/repositories/cat-categories.repository";
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
        @Inject(SymbolsCatalogs.ICatCategoryRepository)
        private readonly catCategoryRepository: ICatCategoryRepository
    ) { }

    async create(product: ICreateProduct): Promise<ProductModel> {
        const { associatedEmotion, essence, brand, category, subCategory, color, ...rest } = product;
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

        const categoryModel = await this.catCategoryRepository.findById(category);
        if (categoryModel) {
            productModel.addCategory(categoryModel);
        }

        if (subCategory) {
            if (!categoryModel.toJSON().subCategories?.some(s => s._id.toString().includes(subCategory))) {
                throw new BaseErrorException(`SubCategory ${subCategory} is not part of Category ${category}`, HttpStatus.BAD_REQUEST);
            }
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

    async update(id: string, product: Partial<ICreateProduct>): Promise<ProductModel> {
        const existingProduct = await this.productRepository.findById(id);
        if (!existingProduct) {
            throw new BaseErrorException('Product not found', HttpStatus.NOT_FOUND);
        }

        const updatedProduct = ProductModel.create({ ...existingProduct.toJSON(), ...product });

        await this.updateAssociatedEmotion(updatedProduct, product.associatedEmotion);
        await this.updateEssence(updatedProduct, product.essence);
        await this.updateBrand(updatedProduct, product.brand);
        await this.updateCategory(updatedProduct, product.category);
        await this.updateSubCategory(updatedProduct, product.subCategory);
        await this.updateColor(updatedProduct, product.color);

        return this.productRepository.update(id, updatedProduct);
    }

    private async updateAssociatedEmotion(updatedProduct: ProductModel, associatedEmotion?: string) {
        if (associatedEmotion) {
            const associatedEmotionModel = await this.catAssociatedEmotionRepository.findById(associatedEmotion);
            if (associatedEmotionModel) {
                updatedProduct.addAssociatedEmotion(associatedEmotionModel);
            }
        }
    }

    private async updateEssence(updatedProduct: ProductModel, essence?: string) {
        if (essence) {
            const essenceModel = await this.catEssenceRepository.findById(essence);
            if (essenceModel) {
                updatedProduct.addEssence(essenceModel);
            }
        }
    }

    private async updateBrand(updatedProduct: ProductModel, brand?: string) {
        if (brand) {
            const brandModel = await this.catBrandRepository.findById(brand);
            if (brandModel) {
                updatedProduct.addBrand(brandModel);
            }
        }
    }

    private async updateCategory(updatedProduct: ProductModel, category?: string) {
        if (category) {
            const categoryModel = await this.catCategoryRepository.findById(category);
            if (categoryModel) {
                updatedProduct.addCategory(categoryModel);
            }
        }
    }

    private async updateSubCategory(updatedProduct: ProductModel, subCategory?: string) {
        if (subCategory) {
            const category = updatedProduct.toJSON().category;
            if (!category.subCategories?.some((s: any) => s._id.toString().includes(subCategory))) {
                throw new BaseErrorException(
                    `SubCategory ${subCategory} is not part of Category ${category._id}`,
                    HttpStatus.BAD_REQUEST
                );
            }
            const subCategoryModel = await this.catSubCategoryRepository.findById(subCategory);
            if (subCategoryModel) {
                updatedProduct.addSubCategory(subCategoryModel);
            }
        }
    }

    private async updateColor(updatedProduct: ProductModel, color?: string) {
        if (color) {
            const colorModel = await this.catColorRepository.findById(color);
            if (colorModel) {
                updatedProduct.addColor(colorModel);
            }
        }
    }
}
