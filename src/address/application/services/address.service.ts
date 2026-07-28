import { HttpStatus, Inject, Injectable } from "@nestjs/common";
import SymbolsCatalogs from "../../../catalogs/symbols-catalogs";
import { TypeRoles } from "../../../core/domain/enums/type-roles.enum";
import { BaseErrorException } from "../../../core/domain/exceptions/base.error.exception";
import { IUserRepository } from "../../../core/domain/repositories/user.interface.repository";
import SymbolsGeo from "../../../geo/symbols-geo";
import SymbolsUser from "../../../user/symbols-user";
import { AddressModel } from "../../domain/models/address.model";
import { GeoModel } from "../../domain/models/geo.model";
import { IAddressRepository } from "../../domain/repositories/address.interface.repository";
import { ICatTypeHousingRepository } from "../../domain/repositories/cat-type-housing.repository";
import { IGeoRepository } from "../../domain/repositories/geo.interface.repository";
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
                user.addAddress(addressModelSaved);
                await this.userRepository.update(user);
            }
        }

        return addressModelSaved;
    }

    async findById(id: string, requesterId: string): Promise<AddressModel> {
        await this.assertCanAccess(id, requesterId);

        return this.addressRepository.findById(id);
    }

    async findByUser(userId: string): Promise<AddressModel[]> {
        const user = await this.userRepository.findById(userId);
        const ids = (user.toJSON().address ?? []).map((addr: any) => String(addr?._id ?? addr));

        return this.addressRepository.findByIds(ids);
    }

    async update(id: string, address: Partial<ICreateAddress>, requesterId: string): Promise<AddressModel> {
        await this.assertCanAccess(id, requesterId);

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

    async delete(id: string, requesterId: string): Promise<AddressModel> {
        await this.assertCanAccess(id, requesterId);

        return this.addressRepository.softDelete(id);
    }

    /**
     * Owner-or-admin, using the same `user.hasAddress()` check that the checkout
     * flow already relies on to bind a shipping address to its owner.
     */
    private async assertCanAccess(addressId: string, requesterId: string): Promise<void> {
        const user = await this.userRepository.findById(requesterId);

        if (user.hasAddress(addressId)) return;

        const isAdmin = (user.toJSON().roles ?? []).some(
            (role: { name: string }) => role.name === TypeRoles.ADMIN,
        );

        if (!isAdmin) {
            throw new BaseErrorException(
                'Access denied: this address belongs to another user',
                HttpStatus.FORBIDDEN,
            );
        }
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
