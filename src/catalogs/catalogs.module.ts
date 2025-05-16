import { Module } from '@nestjs/common/decorators/modules';
import { MongooseModule } from '@nestjs/mongoose';
import {
  catAssociatedEmotionRepository,
  catAssociatedEmotionService,
  catColorRepository,
  catColorService,
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
  catColorSchema,
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

@Module({
  imports: [MongooseModule.forFeature([catRoleSchema, catSubCategorySchema, catColorSchema, catAssociatedEmotionSchema, catTypeHousingSchema, catPaymentMethodSchema])],
  controllers: [CatRoleController, CatSubCategoryController, CatColorController, CatAssociatedEmotionController, CatTypeHousingController, CatPaymentMethodController],
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
  ],
  exports: []
})

export class CatalogsModule { }
