import { Module } from '@nestjs/common/decorators/modules';
import { MongooseModule } from '@nestjs/mongoose';
import {
  analyticsService,
  cartRepository,
  catalogueRepository,
  catPaymentMethodRepository,
  inventoryRepository,
  metricsRepository,
  orderRepository,
} from './infrastructure/nest/constants/custom-provider';
import {
  cartSchema,
  catPaymentMethodSchema,
  metricsSchema,
  orderSchema,
  productSchema,
  userSchema,
} from './infrastructure/nest/constants/custom-schema';
import { AnalyticsController } from './infrastructure/nest/controllers/analytics.controller';

@Module({
  imports: [
    MongooseModule.forFeature([
      metricsSchema,
      orderSchema,
      productSchema,
      userSchema,
      cartSchema,
      catPaymentMethodSchema,
    ]),
  ],
  controllers: [AnalyticsController],
  providers: [
    analyticsService,
    metricsRepository,
    orderRepository,
    catalogueRepository,
    inventoryRepository,
    cartRepository,
    catPaymentMethodRepository,
  ],
  exports: []
})
export class AnalyticsModule { }
