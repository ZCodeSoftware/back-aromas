import { Metrics, MetricsSchema } from '../../../../core/infrastructure/mongo/schemas/public/metrics.schema';
import { Order, OrderSchema } from '../../../../core/infrastructure/mongo/schemas/public/order.schema';
import { Product, ProductSchema } from '../../../../core/infrastructure/mongo/schemas/public/product.schema';
import { User, UserSchema } from '../../../../core/infrastructure/mongo/schemas/public/user.schema';

export const metricsSchema = {
  name: Metrics.name,
  schema: MetricsSchema,
};

export const orderSchema = {
  name: Order.name,
  schema: OrderSchema,
};

export const productSchema = {
  name: Product.name,
  schema: ProductSchema,
};

export const userSchema = {
  name: User.name,
  schema: UserSchema,
};
