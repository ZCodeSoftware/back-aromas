import { HttpStatus, Inject, Injectable } from "@nestjs/common";
import SymbolsCatalogs from "../../../catalogs/symbols-catalogs";
import { BaseErrorException } from "../../../core/domain/exceptions/base.error.exception";
import SymbolsGeo from "../../../geo/symbols-geo";
import SymbolsUser from "../../../user/symbols-user";
import { AddressModel } from "../../domain/models/address.model";
import { GeoModel } from "../../domain/models/geo.model";
import { UserModel } from "../../domain/models/user.model";
import { IAddressRepository } from "../../domain/repositories/address.interface.repository";
import { ICatTypeHousingRepository } from "../../domain/repositories/cat-type-housing.repository";
import { IGeoRepository } from "../../domain/repositories/geo.interface.repository";
import { IUserRepository } from "../../domain/repositories/user.interface.repository";
import { IAddressService } from "../../domain/services/address.interface.service";
import { ICreateAddress, IGeo } from "../../domain/types/address.type";
import SymbolsAddress from "../../symbols-address";

@Injectable()
export class AddressService implements IAddressService {
    constructor(
        @Inject(SymbolsAddress.IAddressRepository)
        private readonly addressRepository: IAddressRepository,
        @Inject(SymbolsCatalogs.ICatTypeHousingRepository)
        private readonly catTypeHousingRepository: ICatTypeHousingRepository,
        @Inject(SymbolsGeo.IGeoRepository)
        private readonly geoRepository: IGeoRepository,
        @Inject(SymbolsUser.IUserRepository)
        private readonly userRepository: IUserRepository
    ) { }

    async create(address: ICreateAddress, userId: string): Promise<AddressModel> {
        const { typeOfHousing, geo, ...addressData } = address;
        const addressModel = AddressModel.create(addressData);

        if (typeOfHousing) {
            const typeHousing = await this.catTypeHousingRepository.findById(typeOfHousing);
            if (typeHousing) {
                addressModel.addTypeOfHousing(typeHousing);
            }
        }

        if (geo) {
            const geoModel = GeoModel.create(geo);
            const geoModel2 = await this.geoRepository.create(geoModel);
            if (geoModel2) {
                addressModel.addGeo(geoModel2);
            }
        }
        const addressModelSaved = await this.addressRepository.create(addressModel);

        if (addressModelSaved) {
            const user = await this.userRepository.findById(userId);
            if (user) {
                console.log('¿Es user una instancia de UserModel?', user instanceof UserModel); // Debería ser true
                console.log('Tipo de user.addAddress:', typeof user.addAddress); // Debería ser 'function'
                user.addAddress(addressModelSaved);
                await this.userRepository.update(user);
            }
        }

        return addressModelSaved;
    }

    async findById(id: string): Promise<AddressModel> {
        return this.addressRepository.findById(id);
    }

    async findAll(): Promise<AddressModel[]> {
        return this.addressRepository.findAll();
    }

    async update(id: string, address: Partial<ICreateAddress>): Promise<AddressModel> {
        const existingAddress = await this.addressRepository.findById(id);
        if (!existingAddress) {
            throw new BaseErrorException('Address not found', HttpStatus.NOT_FOUND);
        }

        const { typeOfHousing, geo, ...addressData } = address;
        const updatedAddress = AddressModel.create({ ...existingAddress.toJSON(), ...addressData });

        await this.updateTypeOfHousing(updatedAddress, typeOfHousing);
        await this.updateGeo(updatedAddress, existingAddress, geo);

        return this.addressRepository.update(id, updatedAddress);
    }

    private async updateTypeOfHousing(updatedAddress: AddressModel, typeOfHousing?: string) {
        if (typeOfHousing) {
            const typeHousing = await this.catTypeHousingRepository.findById(typeOfHousing);
            if (typeHousing) {
                updatedAddress.addTypeOfHousing(typeHousing);
            }
        }
    }

    private async updateGeo(updatedAddress: AddressModel, existingAddress: AddressModel, geo?: IGeo) {
        if (geo) {
            const existingGeo = existingAddress.toJSON().geo;
            const geoModel = GeoModel.create(geo);
            const geoModelSaved = existingGeo?._id
                ? await this.geoRepository.update(existingGeo._id.toString(), geoModel)
                : await this.geoRepository.create(geoModel);
            if (geoModelSaved) {
                updatedAddress.addGeo(geoModelSaved);
            }
        }
    }
}
