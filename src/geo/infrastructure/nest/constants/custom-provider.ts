import { GeoService } from '../../../application/services/geo.service';
import SymbolsGeo from '../../../symbols-geo';
import { GeoRepository } from '../../mongo/repositories/geo.repository';

export const geoService = {
  provide: SymbolsGeo.IGeoService,
  useClass: GeoService,
};

export const geoRepository = {
  provide: SymbolsGeo.IGeoRepository,
  useClass: GeoRepository,
};
