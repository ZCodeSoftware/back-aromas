import { PricingService } from '../../../application/services/pricing.service';
import { PromotionService } from '../../../application/services/promotion.service';
import SymbolsPromotion from '../../../symbols-promotion';
import { PromotionUsageRepository } from '../../mongo/repositories/promotion-usage.repository';
import { PromotionRepository } from '../../mongo/repositories/promotion.repository';

export const promotionService = {
  provide: SymbolsPromotion.IPromotionService,
  useClass: PromotionService,
};

/**
 * The one place that decides what comes off a sale. OrderModule declares it again
 * under the same symbol so the checkout and the counter run this exact code, not
 * a second copy of the rules.
 */
export const pricingService = {
  provide: SymbolsPromotion.IPricingService,
  useClass: PricingService,
};

export const promotionRepository = {
  provide: SymbolsPromotion.IPromotionRepository,
  useClass: PromotionRepository,
};

export const promotionUsageRepository = {
  provide: SymbolsPromotion.IPromotionUsageRepository,
  useClass: PromotionUsageRepository,
};
