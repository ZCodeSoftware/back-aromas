import { Combo, ComboSchema } from '../../../../core/infrastructure/mongo/schemas/public/combo.schema';
import { Product, ProductSchema } from '../../../../core/infrastructure/mongo/schemas/public/product.schema';

export const comboSchema = {
  name: Combo.name,
  schema: ComboSchema,
};

export const productSchema = {
  name: Product.name,
  schema: ProductSchema,
};
