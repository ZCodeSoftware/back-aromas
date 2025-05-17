import { CatAssociatedEmotion, CatAssociatedEmotionSchema } from '../../../../core/infrastructure/mongo/schemas/catalogs/cat-associated-emotion.schema';
import { CatBrand, CatBrandSchema } from '../../../../core/infrastructure/mongo/schemas/catalogs/cat-brand.schema';
import { CatColor, CatColorSchema } from '../../../../core/infrastructure/mongo/schemas/catalogs/cat-color.schema';
import { CatEssence, CatEssenceSchema } from '../../../../core/infrastructure/mongo/schemas/catalogs/cat-essence.schema';
import { CatPaymentMethod, CatPaymentMethodSchema } from '../../../../core/infrastructure/mongo/schemas/catalogs/cat-payment-method.schema';
import { CatRole, CatRoleSchema } from '../../../../core/infrastructure/mongo/schemas/catalogs/cat-role.schema';
import { CatSubCategory, CatSubCategorySchema } from '../../../../core/infrastructure/mongo/schemas/catalogs/cat-sub-category.schema';
import { CatTypeHousing, CatTypeHousingSchema } from '../../../../core/infrastructure/mongo/schemas/catalogs/cat-type-housing.schema';

export const catRoleSchema = {
  name: CatRole.name,
  schema: CatRoleSchema,
};

export const catSubCategorySchema = {
  name: CatSubCategory.name,
  schema: CatSubCategorySchema,
}

export const catColorSchema = {
  name: CatColor.name,
  schema: CatColorSchema,
}

export const catAssociatedEmotionSchema = {
  name: CatAssociatedEmotion.name,
  schema: CatAssociatedEmotionSchema
}

export const catPaymentMethodSchema = {
  name: CatPaymentMethod.name,
  schema: CatPaymentMethodSchema
}

export const catTypeHousingSchema = {
  name: CatTypeHousing.name,
  schema: CatTypeHousingSchema
}

export const catEssenceSchema = {
  name: CatEssence.name,
  schema: CatEssenceSchema
}
export const catBrandSchema = {
  name: CatBrand.name,
  schema: CatBrandSchema
}