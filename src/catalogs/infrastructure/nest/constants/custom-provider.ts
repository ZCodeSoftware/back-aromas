import { CatRoleService } from '../../../application/services/catalogs.service';
import SymbolsCatalogs from '../../../symbols-catalogs';
import { CatRoleRepository } from '../../mongo/repositories/cat-role.repository';

export const catRoleService = {
  provide: SymbolsCatalogs.ICatRoleService,
  useClass: CatRoleService,
};

export const catRoleRepository = {
  provide: SymbolsCatalogs.ICatRoleRepository,
  useClass: CatRoleRepository,
};
