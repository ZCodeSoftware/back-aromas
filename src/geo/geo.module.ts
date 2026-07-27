import { Module } from '@nestjs/common/decorators/modules';
import { MongooseModule } from '@nestjs/mongoose';
import {
  geoRepository,
  geoService,
} from './infrastructure/nest/constants/custom-provider';
import {
  geoSchema,
} from './infrastructure/nest/constants/custom-schema';
import { GeoController } from './infrastructure/nest/controllers/geo.controller';

@Module({
  imports: [MongooseModule.forFeature([geoSchema])],
  controllers: [GeoController],
  providers: [geoService, geoRepository],
  exports: []
})
export class GeoModule {}
