import { HttpStatus, Injectable } from "@nestjs/common";
import { InjectModel } from "@nestjs/mongoose";
import { Model } from "mongoose";
import { BaseErrorException } from "../../../../core/domain/exceptions/base.error.exception";
import { CatOrderStatusModel } from "../../../domain/models/cat-order-status.model";
import { ICatOrderStatusRepository } from "../../../domain/repositories/cat-order-status.repository";
import { CatOrderStatusSchema } from "../schemas/cat-order-status.schema";

@Injectable()
export class CatOrderStatusRepository implements ICatOrderStatusRepository {
    constructor(
        @InjectModel('CatOrderStatus') private readonly catOrderStatusDB: Model<CatOrderStatusSchema>
    ) { }

    async create(catOrderStatus: CatOrderStatusModel): Promise<CatOrderStatusModel> {
        const schema = new this.catOrderStatusDB(catOrderStatus.toJSON());
        const newCatOrderStatus = await schema.save();

        if (!newCatOrderStatus) throw new BaseErrorException(`Order status shouldn't be created`, HttpStatus.BAD_REQUEST);

        return CatOrderStatusModel.hydrate(newCatOrderStatus);
    }

    async findById(id: string): Promise<CatOrderStatusModel | null> {
        const orderStatus = await this.catOrderStatusDB.findById(id);
        if (!orderStatus) return null;
        return CatOrderStatusModel.hydrate(orderStatus);
    }

    async findByCode(code: string): Promise<CatOrderStatusModel | null> {
        const orderStatus = await this.catOrderStatusDB.findOne({ code });
        if (!orderStatus) return null;
        return CatOrderStatusModel.hydrate(orderStatus);
    }

    /**
     * Inactive rows are listed too, unlike the other catalogues: an order that was
     * left on a retired status still has to render its label.
     */
    async findAll(): Promise<CatOrderStatusModel[]> {
        const orderStatuses = await this.catOrderStatusDB.find().sort({ sortOrder: 1 });
        return orderStatuses?.map(orderStatus => CatOrderStatusModel.hydrate(orderStatus));
    }

    async update(id: string, orderStatus: CatOrderStatusModel): Promise<CatOrderStatusModel> {
        // Undefined fields are dropped so a partial body only touches what it sends.
        // `code` goes with them: it is the key every order points at.
        const updateObject = Object.fromEntries(
            Object.entries(orderStatus.toJSON()).filter(
                ([key, value]) => value !== undefined && key !== '_id' && key !== 'code'
            )
        );

        const orderStatusToUpdate = await this.catOrderStatusDB.findByIdAndUpdate(id, updateObject, { new: true });

        if (!orderStatusToUpdate) throw new BaseErrorException(`Order status not found`, HttpStatus.NOT_FOUND);

        return CatOrderStatusModel.hydrate(orderStatusToUpdate);
    }
}
