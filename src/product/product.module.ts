import { Module } from '@nestjs/common/decorators/modules';
import { MongooseModule } from '@nestjs/mongoose';
import {
  catAssociatedEmotionRepository,
  catBrandRepository,
  catCategoryRepository,
  catColorRepository,
  catEssenceRepository,
  catSubCategoryRepository,
  productRepository,
  productService,
} from './infrastructure/nest/constants/custom-provider';
import {
  catAssociatedEmotionSchema,
  catBrandSchema,
  catCategorySchema,
  catColorSchema,
  catEssenceSchema,
  catSubCategorySchema,
  productSchema,
} from './infrastructure/nest/constants/custom-schema';
import { ProductController } from './infrastructure/nest/controllers/product.controller';

@Module({
  imports: [MongooseModule.forFeature([productSchema, catBrandSchema, catEssenceSchema, catColorSchema, catCategorySchema, catSubCategorySchema, catAssociatedEmotionSchema])],
  controllers: [ProductController],
  providers: [productService, productRepository, catBrandRepository, catAssociatedEmotionRepository, catEssenceRepository, catColorRepository, catCategoryRepository, catSubCategoryRepository],
  exports: []
})
export class ProductModule { }
