import SymbolsOrder from '../../../../order/symbols-order';
import SymbolsProduct from '../../../../product/symbols-product';
import { ReviewService } from '../../../application/services/review.service';
import SymbolsReview from '../../../symbols-review';
import { OrderRepository } from '../../mongo/repositories/order.repository';
import { ProductRepository } from '../../mongo/repositories/product.repository';
import { ReviewRepository } from '../../mongo/repositories/review.repository';

export const reviewService = {
  provide: SymbolsReview.IReviewService,
  useClass: ReviewService,
};

export const reviewRepository = {
  provide: SymbolsReview.IReviewRepository,
  useClass: ReviewRepository,
};

export const productRepository = {
  provide: SymbolsProduct.IProductRepository,
  useClass: ProductRepository,
};

export const orderRepository = {
  provide: SymbolsOrder.IOrderRepository,
  useClass: OrderRepository,
};
