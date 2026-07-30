import { CatOrderStatus, CatOrderStatusSchema } from '../../../../core/infrastructure/mongo/schemas/catalogs/cat-order-status.schema';
import { Order, OrderSchema } from '../../../../core/infrastructure/mongo/schemas/public/order.schema';
import { Product, ProductSchema } from '../../../../core/infrastructure/mongo/schemas/public/product.schema';
import { Review, ReviewSchema } from '../../../../core/infrastructure/mongo/schemas/public/review.schema';

export const reviewSchema = {
  name: Review.name,
  schema: ReviewSchema,
};

export const productSchema = {
  name: Product.name,
  schema: ProductSchema,
};

export const orderSchema = {
  name: Order.name,
  schema: OrderSchema,
};

export const catOrderStatusSchema = {
  name: CatOrderStatus.name,
  schema: CatOrderStatusSchema,
};
