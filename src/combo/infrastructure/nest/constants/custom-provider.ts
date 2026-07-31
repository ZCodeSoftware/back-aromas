import SymbolsProduct from '../../../../product/symbols-product';
import { ComboService } from '../../../application/services/combo.service';
import SymbolsCombo from '../../../symbols-combo';
import { ComboRepository } from '../../mongo/repositories/combo.repository';
import { ProductRepository } from '../../mongo/repositories/product.repository';

export const comboService = {
  provide: SymbolsCombo.IComboService,
  useClass: ComboService,
};

export const comboRepository = {
  provide: SymbolsCombo.IComboRepository,
  useClass: ComboRepository,
};

/**
 * The combo module reads products through its own narrow adapter. Declared under
 * the product symbol, like OrderModule does, so the port stays the shared name
 * while each module keeps the implementation it needs.
 */
export const productRepository = {
  provide: SymbolsProduct.IProductRepository,
  useClass: ProductRepository,
};
