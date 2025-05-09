import { CatRole, CatRoleSchema } from '../../../../core/infrastructure/mongo/schemas/catalogs/cat-role.schema';
import { User, UserSchema } from '../../../../core/infrastructure/mongo/schemas/public/user.schema';

export const userSchema = {
  name: User.name,
  schema: UserSchema,
};

export const catRoleSchema = {
  name: CatRole.name,
  schema: CatRoleSchema,
}