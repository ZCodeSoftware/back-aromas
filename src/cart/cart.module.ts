import { Module } from '@nestjs/common/decorators/modules';
import { MongooseModule } from '@nestjs/mongoose';
import {
  cartRepository,
  cartService,
  comboRepository,
  metricsRepository,
  productRepository,
} from './infrastructure/nest/constants/custom-provider';
import {
  cartSchema,
  comboSchema,
  metricsSchema,
  productSchema,
} from './infrastructure/nest/constants/custom-schema';
import { CartController } from './infrastructure/nest/controllers/cart.controller';

@Module({
  imports: [MongooseModule.forFeature([cartSchema, productSchema, comboSchema, metricsSchema])],
  controllers: [CartController],
  providers: [cartService, cartRepository, productRepository, comboRepository, metricsRepository],
  exports: []
})
export class CartModule { }
