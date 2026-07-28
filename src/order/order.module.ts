import { Module } from '@nestjs/common/decorators/modules';
import { MongooseModule } from '@nestjs/mongoose';
import {
  addressRepository,
  cartRepository,
  catPaymentMethodRepository,
  metricsRepository,
  orderRepository,
  orderService,
  posService,
  productRepository,
  stockReservationService,
} from './infrastructure/nest/constants/custom-provider';
import {
  addressSchema,
  cartSchema,
  catPaymentMethodSchema,
  metricsSchema,
  orderSchema,
  productSchema,
} from './infrastructure/nest/constants/custom-schema';
import { OrderController } from './infrastructure/nest/controllers/order.controller';
import { PosController } from './infrastructure/nest/controllers/pos.controller';

@Module({
  imports: [
    MongooseModule.forFeature([
      orderSchema,
      cartSchema,
      productSchema,
      addressSchema,
      catPaymentMethodSchema,
      metricsSchema,
    ]),
  ],
  controllers: [OrderController, PosController],
  providers: [
    orderService,
    posService,
    stockReservationService,
    orderRepository,
    cartRepository,
    productRepository,
    addressRepository,
    catPaymentMethodRepository,
    metricsRepository,
  ],
  exports: []
})
export class OrderModule { }
