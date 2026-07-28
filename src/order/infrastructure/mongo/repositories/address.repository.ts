import { Injectable } from "@nestjs/common";
import { InjectModel } from "@nestjs/mongoose";
import { Model } from "mongoose";
import { Address } from "../../../../core/infrastructure/mongo/schemas/public/address.schema";
import { IAddressRepository } from "../../../domain/repositories/address.interface.repository";
import { IOrderAddress } from "../../../domain/types/order.type";

@Injectable()
export class AddressRepository implements IAddressRepository {
    constructor(
        @InjectModel('Address') private readonly addressDB: Model<Address>
    ) { }

    async findById(id: string): Promise<IOrderAddress | null> {
        const address = await this.addressDB
            .findById(id)
            .select('name street number zipCode description floorAddress')
            .lean();

        if (!address) return null;

        return {
            _id: String(address._id),
            name: address.name,
            street: address.street,
            number: address.number,
            zipCode: address.zipCode,
            description: address.description,
            floorAddress: address.floorAddress,
        };
    }
}
