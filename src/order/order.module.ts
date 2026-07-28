import { Module } from '@nestjs/common/decorators/modules';
import { MongooseModule } from '@nestjs/mongoose';
import {
  addressRepository,
  cartRepository,
  catPaymentMethodRepository,
  metricsRepository,
  orderRepository,
  orderService,
  productRepository,
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
  controllers: [OrderController],
  providers: [
    orderService,
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
