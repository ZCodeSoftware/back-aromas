import SymbolsAddress from '../../../../address/symbols-address';
import SymbolsAnalytics from '../../../../analytics/symbols-analytics';
import SymbolsCart from '../../../../cart/symbols-cart';
import SymbolsCatalogs from '../../../../catalogs/symbols-catalogs';
import SymbolsCombo from '../../../../combo/symbols-combo';
import SymbolsProduct from '../../../../product/symbols-product';
import { PricingService } from '../../../../promotion/application/services/pricing.service';
import { PromotionUsageRepository } from '../../../../promotion/infrastructure/mongo/repositories/promotion-usage.repository';
import { PromotionRepository } from '../../../../promotion/infrastructure/mongo/repositories/promotion.repository';
import SymbolsPromotion from '../../../../promotion/symbols-promotion';
import { OrderService } from '../../../application/services/order.service';
import { PosService } from '../../../application/services/pos.service';
import { StockReservationService } from '../../../application/services/stock-reservation.service';
import SymbolsOrder from '../../../symbols-order';
import { AddressRepository } from '../../mongo/repositories/address.repository';
import { CartRepository } from '../../mongo/repositories/cart.repository';
import { CatOrderStatusRepository } from '../../mongo/repositories/cat-order-status.repository';
import { CatPaymentMethodRepository } from '../../mongo/repositories/cat-payment-method.repository';
import { ComboRepository } from '../../mongo/repositories/combo.repository';
import { MetricsRepository } from '../../mongo/repositories/metrics.repository';
import { OrderRepository } from '../../mongo/repositories/order.repository';
import { ProductRepository } from '../../mongo/repositories/product.repository';

export const orderService = {
  provide: SymbolsOrder.IOrderService,
  useClass: OrderService,
};

export const posService = {
  provide: SymbolsOrder.IPosService,
  useClass: PosService,
};

export const stockReservationService = {
  provide: SymbolsOrder.IStockReservationService,
  useClass: StockReservationService,
};

export const orderRepository = {
  provide: SymbolsOrder.IOrderRepository,
  useClass: OrderRepository,
};

export const cartRepository = {
  provide: SymbolsCart.ICartRepository,
  useClass: CartRepository,
};

export const productRepository = {
  provide: SymbolsProduct.IProductRepository,
  useClass: ProductRepository,
};

export const comboRepository = {
  provide: SymbolsCombo.IComboRepository,
  useClass: ComboRepository,
};

/**
 * Re-declared here, not imported from PromotionModule, following the pattern the
 * rest of this codebase uses: the wiring is duplicated, the class is not, so the
 * counter and the online checkout price a sale through the exact same code.
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

export const addressRepository = {
  provide: SymbolsAddress.IAddressRepository,
  useClass: AddressRepository,
};

export const catPaymentMethodRepository = {
  provide: SymbolsCatalogs.ICatPaymentMethodRepository,
  useClass: CatPaymentMethodRepository,
};

export const catOrderStatusRepository = {
  provide: SymbolsCatalogs.ICatOrderStatusRepository,
  useClass: CatOrderStatusRepository,
};

export const metricsRepository = {
  provide: SymbolsAnalytics.IMetricsRepository,
  useClass: MetricsRepository,
};
