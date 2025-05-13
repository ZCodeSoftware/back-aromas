import { Module } from '@nestjs/common/decorators/modules';
import { MongooseModule } from '@nestjs/mongoose';
import {
  catRoleRepository,
  catRoleService,
  catSubCategoryRepository,
  catSubCategoryService,
} from './infrastructure/nest/constants/custom-provider';
import {
  catRoleSchema,
  catSubCategorySchema,
} from './infrastructure/nest/constants/custom-schema';
import { CatRoleController } from './infrastructure/nest/controllers/catalogs.controller';
import { CatSubCategoryController } from './infrastructure/nest/controllers/cat-sub-category.controller';

@Module({
  imports: [MongooseModule.forFeature([catRoleSchema, catSubCategorySchema])],
  controllers: [CatRoleController, CatSubCategoryController],
  providers: [catRoleRepository, catRoleService, catSubCategoryRepository, catSubCategoryService],
  exports: []
})
export class CatalogsModule { }
