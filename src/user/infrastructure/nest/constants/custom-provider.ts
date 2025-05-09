import SymbolsCatalogs from '../../../../catalogs/symbols-catalogs';
import { UserService } from '../../../application/services/user.service';
import SymbolsUser from '../../../symbols-user';
import { CatRoleRepository } from '../../mongo/repositories/cat-role.repository';
import { UserRepository } from '../../mongo/repositories/user.repository';

export const userService = {
  provide: SymbolsUser.IUserService,
  useClass: UserService,
};

export const userRepository = {
  provide: SymbolsUser.IUserRepository,
  useClass: UserRepository,
};

export const catRoleRepository = {
  provide: SymbolsCatalogs.ICatRoleRepository,
  useClass: CatRoleRepository,
}