import { CatColor, CatColorSchema } from '../../../../core/infrastructure/mongo/schemas/catalogs/cat-color.schema';
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