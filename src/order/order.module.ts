import { Module } from '@nestjs/common/decorators/modules';
import { MongooseModule } from '@nestjs/mongoose';
import {
  addressRepository,
  cartRepository,
  catOrderStatusRepository,
  catPaymentMethodRepository,
  comboRepository,
  metricsRepository,
  orderRepository,
  orderService,
  posService,
  pricingService,
  productRepository,
  promotionRepository,
  promotionUsageRepository,
  stockReservationService,
} from './infrastructure/nest/constants/custom-provider';
import {
  addressSchema,
  cartSchema,
  catOrderStatusSchema,
  catPaymentMethodSchema,
  comboSchema,
  counterSchema,
  metricsSchema,
  orderSchema,
  productSchema,
  promotionSchema,
  promotionUsageSchema,
} from './infrastructure/nest/constants/custom-schema';
import { OrderController } from './infrastructure/nest/controllers/order.controller';
import { PosController } from './infrastructure/nest/controllers/pos.controller';

@Module({
  imports: [
    MongooseModule.forFeature([
      orderSchema,
      cartSchema,
      productSchema,
      comboSchema,
      addressSchema,
      catPaymentMethodSchema,
      catOrderStatusSchema,
      metricsSchema,
      counterSchema,
      promotionSchema,
      promotionUsageSchema,
    ]),
  ],
  controllers: [OrderController, PosController],
  providers: [
    orderService,
    posService,
    stockReservationService,
    pricingService,
    orderRepository,
    cartRepository,
    productRepository,
    comboRepository,
    addressRepository,
    catPaymentMethodRepository,
    catOrderStatusRepository,
    metricsRepository,
    promotionRepository,
    promotionUsageRepository,
  ],
  exports: []
})
export class OrderModule { }
