import { Injectable } from "@nestjs/common";
import { InjectModel } from "@nestjs/mongoose";
import { Model } from "mongoose";
import { round2 } from "../../../../core/domain/utils/money.util";
import { Order } from "../../../../core/infrastructure/mongo/schemas/public/order.schema";
import { OrderStatus, PURCHASED_STATUSES } from "../../../../order/domain/enum/order-status.enum";
import { IOrderRepository } from "../../../domain/repositories/order.interface.repository";
import { ISalesSummary } from "../../../domain/types/analytics.type";

@Injectable()
export class OrderRepository implements IOrderRepository {
    constructor(
        @InjectModel('Order') private readonly orderDB: Model<Order>
    ) { }

    async getSalesSummary(topLimit: number): Promise<ISalesSummary> {
        const [totals, ordersByStatus, topSold] = await Promise.all([
            // Cancelled orders are excluded: they never became revenue.
            this.orderDB.aggregate([
                { $match: { status: { $ne: OrderStatus.CANCELLED } } },
                { $group: { _id: null, totalOrders: { $sum: 1 }, revenue: { $sum: '$totalPrice' } } },
            ]),
            this.orderDB.aggregate([
                { $group: { _id: '$status', count: { $sum: 1 } } },
                { $project: { _id: 0, status: '$_id', count: 1 } },
                { $sort: { status: 1 } },
            ]),
            this.orderDB.aggregate([
                { $match: { status: { $in: PURCHASED_STATUSES } } },
                { $unwind: '$items' },
                {
                    $group: {
                        _id: '$items.product',
                        name: { $first: '$items.name' },
                        quantity: { $sum: '$items.quantity' },
                        revenue: { $sum: '$items.total' },
                    },
                },
                { $sort: { quantity: -1 } },
                { $limit: topLimit },
            ]),
        ]);

        return {
            totalOrders: totals[0]?.totalOrders ?? 0,
            revenue: round2(totals[0]?.revenue ?? 0),
            ordersByStatus,
            topSold: topSold.map((row) => ({
                product: { _id: String(row._id), name: row.name },
                name: row.name,
                quantity: row.quantity,
                revenue: round2(row.revenue),
            })),
        };
    }
}
