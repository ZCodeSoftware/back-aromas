import SymbolsCatalogs from '../../../../catalogs/symbols-catalogs';
import { ProductService } from '../../../application/services/product.service';
import SymbolsProduct from '../../../symbols-product';
import { CatAssociatedEmotionRepository } from '../../mongo/repositories/cat-associated-emotion.repository';
import { CatBrandRepository } from '../../mongo/repositories/cat-brand.repository';
import { CatColorRepository } from '../../mongo/repositories/cat-color.repository';
import { CatEssenceRepository } from '../../mongo/repositories/cat-essence.repository';
import { CatSubCategoryRepository } from '../../mongo/repositories/cat-sub-cartegory.repository';
import { ProductRepository } from '../../mongo/repositories/product.repository';

export const productService = {
  provide: SymbolsProduct.IProductService,
  useClass: ProductService,
};

export const productRepository = {
  provide: SymbolsProduct.IProductRepository,
  useClass: ProductRepository,
};

export const catBrandRepository = {
  provide: SymbolsCatalogs.ICatBrandRepository,
  useClass: CatBrandRepository
}

export const catAssociatedEmotionRepository = {
  provide: SymbolsCatalogs.ICatAssociatedEmotionRepository,
  useClass: CatAssociatedEmotionRepository,
}

export const catEssenceRepository = {
  provide: SymbolsCatalogs.ICatEssenceRepository,
  useClass: CatEssenceRepository,
}

export const catColorRepository = {
  provide: SymbolsCatalogs.ICatColorRepository,
  useClass: CatColorRepository,
}

export const catSubCategoryRepository = {
  provide: SymbolsCatalogs.ICatSubCategoryRepository,
  useClass: CatSubCategoryRepository,
}