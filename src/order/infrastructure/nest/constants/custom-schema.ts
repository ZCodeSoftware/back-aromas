import { CatPaymentMethod, CatPaymentMethodSchema } from '../../../../core/infrastructure/mongo/schemas/catalogs/cat-payment-method.schema';
import { Address, AddressSchema } from '../../../../core/infrastructure/mongo/schemas/public/address.schema';
import { Cart, CartSchema } from '../../../../core/infrastructure/mongo/schemas/public/cart.schema';
import { Metrics, MetricsSchema } from '../../../../core/infrastructure/mongo/schemas/public/metrics.schema';
import { Order, OrderSchema } from '../../../../core/infrastructure/mongo/schemas/public/order.schema';
import { Product, ProductSchema } from '../../../../core/infrastructure/mongo/schemas/public/product.schema';

export const orderSchema = {
  name: Order.name,
  schema: OrderSchema,
};

export const cartSchema = {
  name: Cart.name,
  schema: CartSchema,
};

export const productSchema = {
  name: Product.name,
  schema: ProductSchema,
};

export const addressSchema = {
  name: Address.name,
  schema: AddressSchema,
};

export const catPaymentMethodSchema = {
  name: CatPaymentMethod.name,
  schema: CatPaymentMethodSchema,
};

export const metricsSchema = {
  name: Metrics.name,
  schema: MetricsSchema,
};
