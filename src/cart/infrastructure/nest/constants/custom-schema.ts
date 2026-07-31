import { Cart, CartSchema } from '../../../../core/infrastructure/mongo/schemas/public/cart.schema';
import { Combo, ComboSchema } from '../../../../core/infrastructure/mongo/schemas/public/combo.schema';
import { Metrics, MetricsSchema } from '../../../../core/infrastructure/mongo/schemas/public/metrics.schema';
import { Product, ProductSchema } from '../../../../core/infrastructure/mongo/schemas/public/product.schema';

export const cartSchema = {
  name: Cart.name,
  schema: CartSchema,
};

export const comboSchema = {
  name: Combo.name,
  schema: ComboSchema,
};

export const productSchema = {
  name: Product.name,
  schema: ProductSchema,
};

export const metricsSchema = {
  name: Metrics.name,
  schema: MetricsSchema,
};
