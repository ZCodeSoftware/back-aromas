import { CatTypeHousing, CatTypeHousingSchema } from '../../../../core/infrastructure/mongo/schemas/catalogs/cat-type-housing.schema';
import { Address, AddressSchema } from '../../../../core/infrastructure/mongo/schemas/public/address.schema';
import { Geo, GeoSchema } from '../../../../core/infrastructure/mongo/schemas/public/geo.schema';
import { User, UserSchema } from '../../../../core/infrastructure/mongo/schemas/public/user.schema';

export const addressSchema = {
  name: Address.name,
  schema: AddressSchema,
};

export const geoSchema = {
  name: Geo.name,
  schema: GeoSchema
}

export const typeOfHousingSchema = {
  name: CatTypeHousing.name,
  schema: CatTypeHousingSchema
};

export const userSchema = {
  name: User.name,
  schema: UserSchema
}