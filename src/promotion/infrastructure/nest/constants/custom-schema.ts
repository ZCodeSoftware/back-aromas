import { PromotionUsage, PromotionUsageSchema } from '../../../../core/infrastructure/mongo/schemas/public/promotion-usage.schema';
import { Promotion, PromotionSchema } from '../../../../core/infrastructure/mongo/schemas/public/promotion.schema';

export const promotionSchema = {
  name: Promotion.name,
  schema: PromotionSchema,
};

export const promotionUsageSchema = {
  name: PromotionUsage.name,
  schema: PromotionUsageSchema,
};
