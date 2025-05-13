import { Module } from '@nestjs/common/decorators/modules';
import { MongooseModule } from '@nestjs/mongoose';
import {
  catColorRepository,
  catColorService,
  catRoleRepository,
  catRoleService,
  catSubCategoryRepository,
  catSubCategoryService,
} from './infrastructure/nest/constants/custom-provider';
import {
  catColorSchema,
  catRoleSchema,
  catSubCategorySchema,
} from './infrastructure/nest/constants/custom-schema';
import { CatRoleController } from './infrastructure/nest/controllers/catalogs.controller';
import { CatSubCategoryController } from './infrastructure/nest/controllers/cat-sub-category.controller';
import { CatColorController } from './infrastructure/nest/controllers/cat-color.controller';

@Module({
  imports: [MongooseModule.forFeature([catRoleSchema, catSubCategorySchema, catColorSchema])],
  controllers: [CatRoleController, CatSubCategoryController, CatColorController],
  providers: [catRoleRepository, catRoleService, catSubCategoryRepository, catSubCategoryService, catColorRepository, catColorService],
  exports: []
})

export class CatalogsModule { }
