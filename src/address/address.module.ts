import { Module } from '@nestjs/common/decorators/modules';
import { MongooseModule } from '@nestjs/mongoose';
import {
  addressRepository,
  addressService,
  geoRepository,
  typeOfHousingRepository,
} from './infrastructure/nest/constants/custom-provider';
import {
  addressSchema,
  geoSchema,
  typeOfHousingSchema,
} from './infrastructure/nest/constants/custom-schema';
import { AddressController } from './infrastructure/nest/controllers/address.controller';

@Module({
  imports: [MongooseModule.forFeature([addressSchema, geoSchema, typeOfHousingSchema])],
  controllers: [AddressController],
  providers: [addressService, addressRepository, typeOfHousingRepository, geoRepository],
  exports: []
})
export class AddressModule { }
