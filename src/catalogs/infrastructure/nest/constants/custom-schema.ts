import { CatAssociatedEmotion, CatAssociatedEmotionSchema } from '../../../../core/infrastructure/mongo/schemas/catalogs/cat-associated-emotion.schema';
import { CatColor, CatColorSchema } from '../../../../core/infrastructure/mongo/schemas/catalogs/cat-color.schema';
import { CatPaymentMethod, CatPaymentMethodSchema } from '../../../../core/infrastructure/mongo/schemas/catalogs/cat-payment-method.schema';
import { CatRole, CatRoleSchema } from '../../../../core/infrastructure/mongo/schemas/catalogs/cat-role.schema';
import { CatSubCategory, CatSubCategorySchema } from '../../../../core/infrastructure/mongo/schemas/catalogs/cat-sub-category.schema';

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