import { User, UserSchema } from "../../../../core/infrastructure/mongo/schemas/public/user.schema";


export const userSchema = { name: User.name, schema: UserSchema };
