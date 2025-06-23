import { CatAssociatedEmotionService } from '../../../application/services/cat-associated-emotion.service';
import { CatBrandService } from '../../../application/services/cat-brand.service';
import { CatCategoryService } from '../../../application/services/cat-category.service';
import { CatColorService } from '../../../application/services/cat-color.service';
import { CatEssenceService } from '../../../application/services/cat-essence.service';
import { CatPaymentMethodService } from '../../../application/services/cat-payment-method.service';
import { CatSubCategoryService } from '../../../application/services/cat-sub-category.service';
import { CatTypeHousingService } from '../../../application/services/cat-type-housing.service';
import { CatRoleService } from '../../../application/services/catalogs.service';
import SymbolsCatalogs from '../../../symbols-catalogs';
import { CatAssociatedEmotionRepository } from '../../mongo/repositories/cat-associated-emotion.repository';
import { CatBrandRepository } from '../../mongo/repositories/cat-brand.repository';
import { CatCategoryRepository } from '../../mongo/repositories/cat-category.repository';
import { CatColorRepository } from '../../mongo/repositories/cat-color.repository';
import { CatEssenceRepository } from '../../mongo/repositories/cat-essence.repository';
import { CatPaymentMethodRepository } from '../../mongo/repositories/cat-payment-method.repository';
import { CatRoleRepository } from '../../mongo/repositories/cat-role.repository';
import { CatSubCategoryRepository } from '../../mongo/repositories/cat-sub-cartegory.repository';
import { CatTypeHousingRepository } from '../../mongo/repositories/cat-type-housing.repository';

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

export const catTypeHousingService = {
  provide: SymbolsCatalogs.ICatTypeHousingService,
  useClass: CatTypeHousingService
}

export const catTypeHousingRepository = {
  provide: SymbolsCatalogs.ICatTypeHousingRepository,
  useClass: CatTypeHousingRepository
}

export const catEssenceService = {
  provide: SymbolsCatalogs.ICatEssenceService,
  useClass: CatEssenceService
}
export const catEssenceRepository = {
  provide: SymbolsCatalogs.ICatEssenceRepository,
  useClass: CatEssenceRepository
}
export const catBrandService = {
  provide: SymbolsCatalogs.ICatBrandService,
  useClass: CatBrandService
}

export const catBrandRepository = {
  provide: SymbolsCatalogs.ICatBrandRepository,
  useClass: CatBrandRepository
}

export const catCategoryRepository = {
  provide: SymbolsCatalogs.ICatCategoryRepository,
  useClass: CatCategoryRepository
}
export const catCategoryService = {
  provide: SymbolsCatalogs.ICatCategoryService,
  useClass: CatCategoryService
}