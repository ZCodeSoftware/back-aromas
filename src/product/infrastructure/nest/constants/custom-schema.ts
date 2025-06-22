import { CatAssociatedEmotion, CatAssociatedEmotionSchema } from '../../../../core/infrastructure/mongo/schemas/catalogs/cat-associated-emotion.schema';
import { CatBrand, CatBrandSchema } from '../../../../core/infrastructure/mongo/schemas/catalogs/cat-brand.schema';
import { CatColor, CatColorSchema } from '../../../../core/infrastructure/mongo/schemas/catalogs/cat-color.schema';
import { CatEssence, CatEssenceSchema } from '../../../../core/infrastructure/mongo/schemas/catalogs/cat-essence.schema';
import { CatSubCategory, CatSubCategorySchema } from '../../../../core/infrastructure/mongo/schemas/catalogs/cat-sub-category.schema';
import { Product, ProductSchema } from '../../../../core/infrastructure/mongo/schemas/public/product.schema';

export const productSchema = {
  name: Product.name,
  schema: ProductSchema,
};

export const catBrandSchema = {
  name: CatBrand.name,
  schema: CatBrandSchema,
}

export const catEssenceSchema = {
  name: CatEssence.name,
  schema: CatEssenceSchema,
}

export const catAssociatedEmotionSchema = {
  name: CatAssociatedEmotion.name,
  schema: CatAssociatedEmotionSchema
}

export const catColorSchema = {
  name: CatColor.name,
  schema: CatColorSchema
}

export const catSubCategorySchema = {
  name: CatSubCategory.name,
  schema: CatSubCategorySchema,
}