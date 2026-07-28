import { Module } from '@nestjs/common/decorators/modules';
import { MongooseModule } from '@nestjs/mongoose';
import {
  orderRepository,
  productRepository,
  reviewRepository,
  reviewService,
} from './infrastructure/nest/constants/custom-provider';
import {
  orderSchema,
  productSchema,
  reviewSchema,
} from './infrastructure/nest/constants/custom-schema';
import { ReviewController } from './infrastructure/nest/controllers/review.controller';

@Module({
  imports: [MongooseModule.forFeature([reviewSchema, productSchema, orderSchema])],
  controllers: [ReviewController],
  providers: [reviewService, reviewRepository, productRepository, orderRepository],
  exports: []
})
export class ReviewModule { }
