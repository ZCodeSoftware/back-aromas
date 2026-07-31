import SymbolsAnalytics from '../../../../analytics/symbols-analytics';
import SymbolsCombo from '../../../../combo/symbols-combo';
import SymbolsProduct from '../../../../product/symbols-product';
import { CartService } from '../../../application/services/cart.service';
import SymbolsCart from '../../../symbols-cart';
import { CartRepository } from '../../mongo/repositories/cart.repository';
import { ComboRepository } from '../../mongo/repositories/combo.repository';
import { MetricsRepository } from '../../mongo/repositories/metrics.repository';
import { ProductRepository } from '../../mongo/repositories/product.repository';

export const cartService = {
  provide: SymbolsCart.ICartService,
  useClass: CartService,
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

export const metricsRepository = {
  provide: SymbolsAnalytics.IMetricsRepository,
  useClass: MetricsRepository,
};
