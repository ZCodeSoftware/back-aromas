import { Module } from '@nestjs/common/decorators/modules';
import { MongooseModule } from '@nestjs/mongoose';
import {
  analyticsService,
  catalogueRepository,
  metricsRepository,
  orderRepository,
} from './infrastructure/nest/constants/custom-provider';
import {
  metricsSchema,
  orderSchema,
  productSchema,
  userSchema,
} from './infrastructure/nest/constants/custom-schema';
import { AnalyticsController } from './infrastructure/nest/controllers/analytics.controller';

@Module({
  imports: [MongooseModule.forFeature([metricsSchema, orderSchema, productSchema, userSchema])],
  controllers: [AnalyticsController],
  providers: [analyticsService, metricsRepository, orderRepository, catalogueRepository],
  exports: []
})
export class AnalyticsModule { }
