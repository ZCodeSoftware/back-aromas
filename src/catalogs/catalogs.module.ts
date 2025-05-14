import { Module } from '@nestjs/common/decorators/modules';
import { MongooseModule } from '@nestjs/mongoose';
import {
  catAssociatedEmotionRepository,
  catAssociatedEmotionService,
  catColorRepository,
  catColorService,
  catRoleRepository,
  catRoleService,
  catSubCategoryRepository,
  catSubCategoryService,
} from './infrastructure/nest/constants/custom-provider';
import {
  catAssociatedEmotionSchema,
  catColorSchema,
  catRoleSchema,
  catSubCategorySchema,
} from './infrastructure/nest/constants/custom-schema';
import { CatRoleController } from './infrastructure/nest/controllers/catalogs.controller';
import { CatSubCategoryController } from './infrastructure/nest/controllers/cat-sub-category.controller';
import { CatColorController } from './infrastructure/nest/controllers/cat-color.controller';
import { CatAssociatedEmotionController } from './infrastructure/nest/controllers/cat-associated-emotion.controller';

@Module({
  imports: [MongooseModule.forFeature([catRoleSchema, catSubCategorySchema, catColorSchema, catAssociatedEmotionSchema])],
  controllers: [CatRoleController, CatSubCategoryController, CatColorController, CatAssociatedEmotionController],
  providers: [
    catRoleRepository,
    catRoleService,
    catSubCategoryRepository,
    catSubCategoryService,
    catColorRepository,
    catColorService,
    catAssociatedEmotionRepository,
    catAssociatedEmotionService,
  ],
  exports: []
})

export class CatalogsModule { }
