import { Module } from '@nestjs/common/decorators/modules';
import { MongooseModule } from '@nestjs/mongoose';
import {
  cartRepository,
  cartService,
  metricsRepository,
  productRepository,
} from './infrastructure/nest/constants/custom-provider';
import {
  cartSchema,
  metricsSchema,
  productSchema,
} from './infrastructure/nest/constants/custom-schema';
import { CartController } from './infrastructure/nest/controllers/cart.controller';

@Module({
  imports: [MongooseModule.forFeature([cartSchema, productSchema, metricsSchema])],
  controllers: [CartController],
  providers: [cartService, cartRepository, productRepository, metricsRepository],
  exports: []
})
export class CartModule { }
