import { Injectable } from "@nestjs/common";
import { InjectModel } from "@nestjs/mongoose";
import { Model, Types } from "mongoose";
import { CatOrderStatus } from "../../../../core/infrastructure/mongo/schemas/catalogs/cat-order-status.schema";
import { OrderStatusCatalog } from "../../../../core/infrastructure/mongo/utils/order-status-catalog";
import { OrderStatus } from "../../../domain/enum/order-status.enum";
import { ICatOrderStatusRepository } from "../../../domain/repositories/cat-order-status.interface.repository";
import { IOrderStatusRef } from "../../../domain/types/order.type";

@Injectable()
export class CatOrderStatusRepository implements ICatOrderStatusRepository {
    private readonly catalog: OrderStatusCatalog;

    constructor(
        @InjectModel('CatOrderStatus') catOrderStatusDB: Model<CatOrderStatus>
    ) {
        this.catalog = new OrderStatusCatalog(catOrderStatusDB);
    }

    async findByCode(code: OrderStatus): Promise<IOrderStatusRef | null> {
        return this.catalog.findByCode(code);
    }

    async idsByCodes(codes: OrderStatus[]): Promise<Types.ObjectId[]> {
        return this.catalog.idsByCodes(codes);
    }
}
