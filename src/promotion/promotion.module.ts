import { Module } from '@nestjs/common/decorators/modules';
import { MongooseModule } from '@nestjs/mongoose';
import {
  pricingService,
  promotionRepository,
  promotionService,
  promotionUsageRepository,
} from './infrastructure/nest/constants/custom-provider';
import {
  promotionSchema,
  promotionUsageSchema,
} from './infrastructure/nest/constants/custom-schema';
import { PromotionController } from './infrastructure/nest/controllers/promotion.controller';

@Module({
  imports: [MongooseModule.forFeature([promotionSchema, promotionUsageSchema])],
  controllers: [PromotionController],
  providers: [promotionService, pricingService, promotionRepository, promotionUsageRepository],
  exports: []
})
export class PromotionModule { }
