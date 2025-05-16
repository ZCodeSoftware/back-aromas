import { CatAssociatedEmotionService } from '../../../application/services/cat-Associated-emotion.service';
import { CatColorService } from '../../../application/services/cat-color.service';
import { CatSubCategoryService } from '../../../application/services/cat-sub-category.service';
import { CatPaymentMethodService } from '../../../application/services/cat-payment-method.service';
import { CatRoleService } from '../../../application/services/catalogs.service';
import SymbolsCatalogs from '../../../symbols-catalogs';
import { CatAssociatedEmotionRepository } from '../../mongo/repositories/cat-associated-emotion.repository';
import { CatColorRepository } from '../../mongo/repositories/cat-color.repository';
import { CatRoleRepository } from '../../mongo/repositories/cat-role.repository';
import { CatSubCategoryRepository } from '../../mongo/repositories/cat-sub-cartegory.repository';
import { CatPaymentMethodRepository } from '../../mongo/repositories/cat-payment-method.repository';

export const catRoleService = {
  provide: SymbolsCatalogs.ICatRoleService,
  useClass: CatRoleService,
};

export const catRoleRepository = {
  provide: SymbolsCatalogs.ICatRoleRepository,
  useClass: CatRoleRepository,
};


export const catSubCategoryService = {
  provide: SymbolsCatalogs.ICatSubCategoryService,
  useClass: CatSubCategoryService
}

export const catSubCategoryRepository = {
  provide: SymbolsCatalogs.ICatSubCategoryRepository,
  useClass: CatSubCategoryRepository
}

export const catColorRepository = {
  provide: SymbolsCatalogs.ICatColorRepository,
  useClass: CatColorRepository
}

export const catColorService = {
  provide: SymbolsCatalogs.ICatColorService,
  useClass: CatColorService
}

export const catAssociatedEmotionService = {
  provide: SymbolsCatalogs.ICatAssociatedEmotionService,
  useClass: CatAssociatedEmotionService
}

export const catAssociatedEmotionRepository = {
  provide: SymbolsCatalogs.ICatAssociatedEmotionRepository,
  useClass: CatAssociatedEmotionRepository
}

export const catPaymentMethodService = {
  provide: SymbolsCatalogs.ICatPaymentMethodService,
  useClass: CatPaymentMethodService
}
export const catPaymentMethodRepository = {
  provide: SymbolsCatalogs.ICatPaymentMethodRepository,
  useClass: CatPaymentMethodRepository
}

