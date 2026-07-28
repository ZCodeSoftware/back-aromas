import SymbolsOrder from '../../../../order/symbols-order';
import { AnalyticsService } from '../../../application/services/analytics.service';
import SymbolsAnalytics from '../../../symbols-analytics';
import { CatalogueRepository } from '../../mongo/repositories/catalogue.repository';
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
