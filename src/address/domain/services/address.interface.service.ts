import { AddressModel } from "../models/address.model";
import { ICreateAddress } from "../types/address.type";

/**
 * Every read and write below is scoped to the requester: an address is personal
 * data, so `requesterId` must own it or be an admin.
 */
export interface IAddressService {
    create(address: ICreateAddress, userId: string): Promise<AddressModel>;
    findById(id: string, requesterId: string): Promise<AddressModel>;
    findByUser(userId: string): Promise<AddressModel[]>;
    update(id: string, address: Partial<ICreateAddress>, requesterId: string): Promise<AddressModel>;
    delete(id: string, requesterId: string): Promise<AddressModel>;
}
