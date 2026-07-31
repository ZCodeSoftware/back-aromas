import { Injectable } from "@nestjs/common";
import { InjectModel } from "@nestjs/mongoose";
import { Model } from "mongoose";
import { CatOrderStatus } from "../../../../core/infrastructure/mongo/schemas/catalogs/cat-order-status.schema";
import { Order } from "../../../../core/infrastructure/mongo/schemas/public/order.schema";
import { OrderStatusCatalog } from "../../../../core/infrastructure/mongo/utils/order-status-catalog";
import { PURCHASED_STATUSES } from "../../../../order/domain/enum/order-status.enum";
import { IOrderRepository } from "../../../domain/repositories/order.interface.repository";

@Injectable()
export class OrderRepository implements IOrderRepository {
    /** Orders point at `cat_order_status` by id, so the codes have to be resolved. */
    private readonly statusCatalog: OrderStatusCatalog;

    constructor(
        @InjectModel('Order') private readonly orderDB: Model<Order>,
        @InjectModel('CatOrderStatus') catOrderStatusDB: Model<CatOrderStatus>,
    ) {
        this.statusCatalog = new OrderStatusCatalog(catOrderStatusDB);
    }

    async hasPurchasedProduct(userId: string, productId: string): Promise<boolean> {
        const count = await this.orderDB.countDocuments({
            user: userId,
            // Buying the product inside a combo counts: otherwise a customer who
            // only ever got it as part of a bundle could not review it.
            $or: [{ 'items.product': productId }, { 'items.components.product': productId }],
            status: { $in: await this.statusCatalog.idsByCodes(PURCHASED_STATUSES) },
        });

        return count > 0;
    }
}
