import { Module } from '@nestjs/common/decorators/modules';
import { MongooseModule } from '@nestjs/mongoose';
import {
  addressRepository,
  addressService,
  geoRepository,
  typeOfHousingRepository,
  userRepository,
} from './infrastructure/nest/constants/custom-provider';
import {
  addressSchema,
  geoSchema,
  typeOfHousingSchema,
  userSchema,
} from './infrastructure/nest/constants/custom-schema';
import { AddressController } from './infrastructure/nest/controllers/address.controller';

@Module({
  imports: [MongooseModule.forFeature([addressSchema, geoSchema, typeOfHousingSchema, userSchema])],
  controllers: [AddressController],
  providers: [addressService, addressRepository, typeOfHousingRepository, geoRepository, userRepository],
  exports: []
})
export class AddressModule { }
