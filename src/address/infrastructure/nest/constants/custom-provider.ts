import SymbolsCatalogs from '../../../../catalogs/symbols-catalogs';
import SymbolsGeo from '../../../../geo/symbols-geo';
import SymbolsUser from '../../../../user/symbols-user';
import { AddressService } from '../../../application/services/address.service';
import SymbolsAddress from '../../../symbols-address';
import { AddressRepository } from '../../mongo/repositories/address.repository';
import { CatTypeHousingRepository } from '../../mongo/repositories/cat-type-housing.repository';
import { GeoRepository } from '../../mongo/repositories/geo.repository';
import { UserRepository } from '../../mongo/repositories/user.repository';

export const addressService = {
  provide: SymbolsAddress.IAddressService,
  useClass: AddressService,
};

export const addressRepository = {
  provide: SymbolsAddress.IAddressRepository,
  useClass: AddressRepository,
};

export const typeOfHousingRepository = {
  provide: SymbolsCatalogs.ICatTypeHousingRepository,
  useClass: CatTypeHousingRepository,
};

export const geoRepository = {
  provide: SymbolsGeo.IGeoRepository,
  useClass: GeoRepository,
};

export const userRepository = {
  provide: SymbolsUser.IUserRepository,
  useClass: UserRepository,
};
