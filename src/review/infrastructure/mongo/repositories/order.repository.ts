import { Injectable } from "@nestjs/common";
import { InjectModel } from "@nestjs/mongoose";
import { Model } from "mongoose";
import { Order } from "../../../../core/infrastructure/mongo/schemas/public/order.schema";
import { PURCHASED_STATUSES } from "../../../../order/domain/enum/order-status.enum";
import { IOrderRepository } from "../../../domain/repositories/order.interface.repository";

@Injectable()
export class OrderRepository implements IOrderRepository {
    constructor(
        @InjectModel('Order') private readonly orderDB: Model<Order>
    ) { }

    async hasPurchasedProduct(userId: string, productId: string): Promise<boolean> {
        const count = await this.orderDB.countDocuments({
            user: userId,
            'items.product': productId,
            status: { $in: PURCHASED_STATUSES },
        });

        return count > 0;
    }
}
