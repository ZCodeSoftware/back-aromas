import { AddressModel } from "../models/address.model";

export interface IAddressRepository {
    create(address: AddressModel): Promise<AddressModel>;
    findById(id: string): Promise<AddressModel>;
    findAll(): Promise<AddressModel[]>;
    update(id: string, address: AddressModel): Promise<AddressModel>;
    /** Soft delete: flips isActive to false, the row is kept. */
    softDelete(id: string): Promise<AddressModel>;
}
