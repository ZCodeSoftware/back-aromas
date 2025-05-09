import { Module } from '@nestjs/common/decorators/modules';
import { MongooseModule } from '@nestjs/mongoose';
import {
  catRoleRepository,
  catRoleService,
} from './infrastructure/nest/constants/custom-provider';
import {
  catRoleSchema,
} from './infrastructure/nest/constants/custom-schema';
import { CatRoleController } from './infrastructure/nest/controllers/catalogs.controller';

@Module({
  imports: [MongooseModule.forFeature([catRoleSchema])],
  controllers: [CatRoleController],
  providers: [catRoleRepository, catRoleService],
  exports: []
})
export class CatalogsModule { }
