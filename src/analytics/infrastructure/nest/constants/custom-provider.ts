import SymbolsCatalogs from '../../../../catalogs/symbols-catalogs';
import SymbolsOrder from '../../../../order/symbols-order';
import { AnalyticsService } from '../../../application/services/analytics.service';
import SymbolsAnalytics from '../../../symbols-analytics';
import { CartRepository } from '../../mongo/repositories/cart.repository';
import { CatPaymentMethodRepository } from '../../mongo/repositories/cat-payment-method.repository';
import { CatalogueRepository } from '../../mongo/repositories/catalogue.repository';
import { InventoryRepository } from '../../mongo/repositories/inventory.repository';
import { MetricsRepository } from '../../mongo/repositories/metrics.repository';
import { OrderRepository } from '../../mongo/repositories/order.repository';

export const analyticsService = {
  provide: SymbolsAnalytics.IAnalyticsService,
  useClass: AnalyticsService,
};

export const metricsRepository = {
  provide: SymbolsAnalytics.IMetricsRepository,
  useClass: MetricsRepository,
};

export const orderRepository = {
  provide: SymbolsOrder.IOrderRepository,
  useClass: OrderRepository,
};

export const catalogueRepository = {
  provide: SymbolsAnalytics.ICatalogueRepository,
  useClass: CatalogueRepository,
};

export const inventoryRepository = {
  provide: SymbolsAnalytics.IInventoryRepository,
  useClass: InventoryRepository,
};

export const cartRepository = {
  provide: SymbolsAnalytics.ICartRepository,
  useClass: CartRepository,
};

export const catPaymentMethodRepository = {
  provide: SymbolsCatalogs.ICatPaymentMethodRepository,
  useClass: CatPaymentMethodRepository,
};
