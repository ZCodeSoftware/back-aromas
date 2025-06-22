import { Module } from '@nestjs/common/decorators/modules';
import { MongooseModule } from '@nestjs/mongoose';
import {
  catAssociatedEmotionRepository,
  catBrandRepository,
  catColorRepository,
  catEssenceRepository,
  catSubCategoryRepository,
  productRepository,
  productService,
} from './infrastructure/nest/constants/custom-provider';
import {
  catAssociatedEmotionSchema,
  catBrandSchema,
  catColorSchema,
  catEssenceSchema,
  catSubCategorySchema,
  productSchema,
} from './infrastructure/nest/constants/custom-schema';
import { ProductController } from './infrastructure/nest/controllers/product.controller';

@Module({
  imports: [MongooseModule.forFeature([productSchema, catBrandSchema, catEssenceSchema, catColorSchema, catSubCategorySchema, catAssociatedEmotionSchema])],
  controllers: [ProductController],
  providers: [productService, productRepository, catBrandRepository, catAssociatedEmotionRepository, catEssenceRepository, catColorRepository, catSubCategoryRepository],
  exports: []
})
export class ProductModule { }
