import SymbolsAddress from '../../../../address/symbols-address';
import SymbolsAnalytics from '../../../../analytics/symbols-analytics';
import SymbolsCart from '../../../../cart/symbols-cart';
import SymbolsCatalogs from '../../../../catalogs/symbols-catalogs';
import SymbolsProduct from '../../../../product/symbols-product';
import { OrderService } from '../../../application/services/order.service';
import SymbolsOrder from '../../../symbols-order';
import { AddressRepository } from '../../mongo/repositories/address.repository';
import { CartRepository } from '../../mongo/repositories/cart.repository';
import { CatPaymentMethodRepository } from '../../mongo/repositories/cat-payment-method.repository';
import { MetricsRepository } from '../../mongo/repositories/metrics.repository';
import { OrderRepository } from '../../mongo/repositories/order.repository';
import { ProductRepository } from '../../mongo/repositories/product.repository';

export const orderService = {
  provide: SymbolsOrder.IOrderService,
  useClass: OrderService,
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

export const addressRepository = {
  provide: SymbolsAddress.IAddressRepository,
  useClass: AddressRepository,
};

export const catPaymentMethodRepository = {
  provide: SymbolsCatalogs.ICatPaymentMethodRepository,
  useClass: CatPaymentMethodRepository,
};

export const metricsRepository = {
  provide: SymbolsAnalytics.IMetricsRepository,
  useClass: MetricsRepository,
};
