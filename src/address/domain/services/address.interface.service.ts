import { AddressModel } from "../models/address.model";
import { ICreateAddress } from "../types/address.type";

export interface IAddressService {
    create(address: ICreateAddress, userId: string): Promise<AddressModel>;
    findById(id: string): Promise<AddressModel>;
    findAll(): Promise<AddressModel[]>;
    update(id: string, address: Partial<ICreateAddress>): Promise<AddressModel>;
}
