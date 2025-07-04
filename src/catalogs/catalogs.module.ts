import { Module } from '@nestjs/common/decorators/modules';
import { MongooseModule } from '@nestjs/mongoose';
import {
  catAssociatedEmotionRepository,
  catAssociatedEmotionService,
  catBrandRepository,
  catBrandService,
  catCategoryRepository,
  catCategoryService,
  catColorRepository,
  catColorService,
  catEssenceRepository,
  catEssenceService,
  catPaymentMethodRepository,
  catPaymentMethodService,
  catRoleRepository,
  catRoleService,
  catSubCategoryRepository,
  catSubCategoryService,
  catTypeHousingRepository,
  catTypeHousingService,
} from './infrastructure/nest/constants/custom-provider';
import {
  catAssociatedEmotionSchema,
  catBrandSchema,
  catCategorySchema,
  catColorSchema,
  catEssenceSchema,
  catPaymentMethodSchema,
  catRoleSchema,
  catSubCategorySchema,
  catTypeHousingSchema,
} from './infrastructure/nest/constants/custom-schema';
import { CatAssociatedEmotionController } from './infrastructure/nest/controllers/cat-associated-emotion.controller';
import { CatColorController } from './infrastructure/nest/controllers/cat-color.controller';
import { CatSubCategoryController } from './infrastructure/nest/controllers/cat-sub-category.controller';
import { CatPaymentMethodController } from './infrastructure/nest/controllers/cat-payment-method.controller';
import { CatRoleController } from './infrastructure/nest/controllers/catalogs.controller';
import { CatTypeHousingController } from './infrastructure/nest/controllers/cat-type-housing.controller';
import { CatEssenceController } from './infrastructure/nest/controllers/cat-essence.controller';
import { CatBrandController } from './infrastructure/nest/controllers/cat-brand.controller';
import { CatCategoryContorller } from './infrastructure/nest/controllers/cat-category.controller';

@Module({
  imports: [MongooseModule.forFeature([
    catRoleSchema,
    catSubCategorySchema,
    catColorSchema,
    catAssociatedEmotionSchema,
    catTypeHousingSchema,
    catPaymentMethodSchema,
    catBrandSchema,
    catEssenceSchema,
    catCategorySchema
  ])],
  controllers: [
    CatRoleController,
    CatSubCategoryController,
    CatColorController,
    CatAssociatedEmotionController,
    CatTypeHousingController,
    CatPaymentMethodController,
    CatBrandController,
    CatEssenceController,
    CatCategoryContorller,
  ],
  providers: [
    catRoleRepository,
    catRoleService,
    catSubCategoryRepository,
    catSubCategoryService,
    catColorRepository,
    catColorService,
    catAssociatedEmotionRepository,
    catAssociatedEmotionService,
    catPaymentMethodRepository,
    catPaymentMethodService,
    catTypeHousingRepository,
    catTypeHousingService,
    catBrandRepository,
    catBrandService,
    catEssenceRepository,
    catEssenceService,
    catCategoryRepository,
    catCategoryService
  ],
  exports: []
})

export class CatalogsModule { }
