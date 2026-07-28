import { Injectable } from "@nestjs/common";
import { InjectModel } from "@nestjs/mongoose";
import { Model } from "mongoose";
import { round2 } from "../../../../core/domain/utils/money.util";
import { Order } from "../../../../core/infrastructure/mongo/schemas/public/order.schema";
import { OrderChannel } from "../../../../order/domain/enum/order-channel.enum";
import { PURCHASED_STATUSES, REVENUE_STATUSES } from "../../../../order/domain/enum/order-status.enum";
import { IOrderRepository } from "../../../domain/repositories/order.interface.repository";
import {
    IAnonymousSales,
    IBreakdownRow,
    ICustomerCohorts,
    ISalesDailyRow,
    ISalesSummary,
    ITopCustomer,
} from "../../../domain/types/analytics.type";
import { IResolvedRange } from "../../../domain/utils/date-range.util";

/** Money actually taken, as opposed to every order that was not reversed. */
const IS_PAID = { $in: ['$status', PURCHASED_STATUSES] };

@Injectable()
export class OrderRepository implements IOrderRepository {
    constructor(
        @InjectModel('Order') private readonly orderDB: Model<Order>
    ) { }

    async getSalesSummary(topLimit: number, range?: IResolvedRange | null): Promise<ISalesSummary> {
        const window = this.dateFilter(range);

        const [totals, ordersByStatus, topSold] = await Promise.all([
            // Cancelled and refunded orders are excluded: the money is not ours.
            // `$in` on the enumerated complement rather than `$nin`, so the
            // { status, createdAt } index can bound the scan.
            this.orderDB.aggregate([
                { $match: { status: { $in: REVENUE_STATUSES }, ...window } },
                {
                    $group: {
                        _id: null,
                        totalOrders: { $sum: 1 },
                        revenue: { $sum: '$totalPrice' },
                        subTotal: { $sum: '$subTotalPrice' },
                        shipping: { $sum: '$shippingPrice' },
                        paidOrders: { $sum: { $cond: [IS_PAID, 1, 0] } },
                        paidRevenue: { $sum: { $cond: [IS_PAID, '$totalPrice', 0] } },
                    },
                },
            ]),
            this.orderDB.aggregate([
                { $match: { ...window } },
                { $group: { _id: '$status', count: { $sum: 1 } } },
                { $project: { _id: 0, status: '$_id', count: 1 } },
                { $sort: { status: 1 } },
            ]),
            this.orderDB.aggregate([
                { $match: { status: { $in: PURCHASED_STATUSES }, ...window } },
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

        const row = totals[0];

        return {
            totalOrders: row?.totalOrders ?? 0,
            revenue: round2(row?.revenue ?? 0),
            paidOrders: row?.paidOrders ?? 0,
            paidRevenue: round2(row?.paidRevenue ?? 0),
            subTotal: round2(row?.subTotal ?? 0),
            shipping: round2(row?.shipping ?? 0),
            ordersByStatus,
            topSold: topSold.map((entry) => ({
                product: { _id: String(entry._id), name: entry.name },
                name: entry.name,
                quantity: entry.quantity,
                revenue: round2(entry.revenue),
            })),
        };
    }

    async getSalesDaily(range: IResolvedRange): Promise<ISalesDailyRow[]> {
        const rows = await this.orderDB.aggregate([
            { $match: { status: { $in: REVENUE_STATUSES }, ...this.dateFilter(range) } },
            {
                $group: {
                    // $dateToString with a timezone works from MongoDB 3.6 and takes
                    // fixed offsets; $dateTrunc would need 5.0 and return an instant
                    // that has to be re-formatted anyway. Passing the same offset
                    // string used to fill gaps keeps both sides on the same days.
                    _id: {
                        $dateToString: { format: '%Y-%m-%d', date: '$createdAt', timezone: range.timezone },
                    },
                    orders: { $sum: 1 },
                    revenue: { $sum: '$totalPrice' },
                    subTotal: { $sum: '$subTotalPrice' },
                    shipping: { $sum: '$shippingPrice' },
                    paidOrders: { $sum: { $cond: [IS_PAID, 1, 0] } },
                    paidRevenue: { $sum: { $cond: [IS_PAID, '$totalPrice', 0] } },
                },
            },
            {
                $project: {
                    _id: 0,
                    day: '$_id',
                    orders: 1,
                    revenue: 1,
                    subTotal: 1,
                    shipping: 1,
                    paidOrders: 1,
                    paidRevenue: 1,
                },
            },
            { $sort: { day: 1 } },
        ]);

        return rows as ISalesDailyRow[];
    }

    async getSalesBreakdown(range: IResolvedRange): Promise<IBreakdownRow[]> {
        const rows = await this.orderDB.aggregate([
            { $match: { status: { $in: REVENUE_STATUSES }, ...this.dateFilter(range) } },
            {
                $group: {
                    // $ifNull belongs here and never in $match: a match on a computed
                    // expression cannot use an index, grouping on one is free.
                    _id: {
                        channel: { $ifNull: ['$channel', OrderChannel.ONLINE] },
                        paymentMethod: '$paymentMethod',
                    },
                    orders: { $sum: 1 },
                    revenue: { $sum: '$totalPrice' },
                    paidOrders: { $sum: { $cond: [IS_PAID, 1, 0] } },
                    paidRevenue: { $sum: { $cond: [IS_PAID, '$totalPrice', 0] } },
                },
            },
            { $sort: { revenue: -1 } },
        ]);

        return rows.map((row) => ({
            channel: row._id.channel,
            paymentMethodId: row._id.paymentMethod ? String(row._id.paymentMethod) : null,
            orders: row.orders,
            revenue: round2(row.revenue),
            paidOrders: row.paidOrders,
            paidRevenue: round2(row.paidRevenue),
        }));
    }

    async getTopCustomers(range: IResolvedRange, limit: number): Promise<ITopCustomer[]> {
        const rows = await this.orderDB.aggregate([
            {
                $match: {
                    status: { $in: REVENUE_STATUSES },
                    ...this.dateFilter(range),
                    // Excludes both an explicit null and a missing field, which is
                    // exactly the counter sales with no account. The complement,
                    // `user: null`, is what getAnonymousSales matches.
                    user: { $ne: null },
                },
            },
            {
                $group: {
                    _id: '$user',
                    orders: { $sum: 1 },
                    revenue: { $sum: '$totalPrice' },
                    lastOrderAt: { $max: '$createdAt' },
                },
            },
            { $sort: { revenue: -1 } },
            { $limit: limit },
            // After $limit, so this is a handful of point lookups by _id.
            {
                $lookup: {
                    from: 'user',
                    localField: '_id',
                    foreignField: '_id',
                    as: 'user',
                    pipeline: [{ $project: { firstName: 1, lastName: 1, email: 1 } }],
                },
            },
            { $unwind: { path: '$user', preserveNullAndEmptyArrays: true } },
        ]);

        return rows.map((row) => ({
            userId: String(row._id),
            firstName: row.user?.firstName,
            lastName: row.user?.lastName,
            email: row.user?.email,
            orders: row.orders,
            revenue: round2(row.revenue),
            lastOrderAt: row.lastOrderAt,
        }));
    }

    async getCustomerCohorts(range: IResolvedRange): Promise<ICustomerCohorts> {
        const inRange = {
            $and: [
                { $gte: ['$createdAt', range.from] },
                { $lt: ['$createdAt', range.toExclusive] },
            ],
        };

        // Deliberately unbounded by date: "first order ever" cannot be answered
        // from a slice of the collection. allowDiskUse because this is the one
        // aggregate here that groups the whole thing.
        const rows = await this.orderDB
            .aggregate([
                { $match: { status: { $in: REVENUE_STATUSES }, user: { $ne: null } } },
                {
                    $group: {
                        _id: '$user',
                        firstOrderAt: { $min: '$createdAt' },
                        ordersInRange: { $sum: { $cond: [inRange, 1, 0] } },
                        revenueInRange: { $sum: { $cond: [inRange, '$totalPrice', 0] } },
                    },
                },
                { $match: { ordersInRange: { $gt: 0 } } },
                {
                    $group: {
                        _id: {
                            $and: [
                                { $gte: ['$firstOrderAt', range.from] },
                                { $lt: ['$firstOrderAt', range.toExclusive] },
                            ],
                        },
                        customers: { $sum: 1 },
                        orders: { $sum: '$ordersInRange' },
                        revenue: { $sum: '$revenueInRange' },
                    },
                },
            ])
            .allowDiskUse(true);

        const isNew = rows.find((row) => row._id === true);
        const isReturning = rows.find((row) => row._id === false);

        return {
            newCustomers: isNew?.customers ?? 0,
            returningCustomers: isReturning?.customers ?? 0,
            ordersFromNew: isNew?.orders ?? 0,
            ordersFromReturning: isReturning?.orders ?? 0,
            revenueFromNew: round2(isNew?.revenue ?? 0),
            revenueFromReturning: round2(isReturning?.revenue ?? 0),
        };
    }

    async getAnonymousSales(range: IResolvedRange): Promise<IAnonymousSales> {
        const rows = await this.orderDB.aggregate([
            {
                $match: {
                    status: { $in: REVENUE_STATUSES },
                    ...this.dateFilter(range),
                    // Matches a missing field as well as an explicit null.
                    user: null,
                },
            },
            { $group: { _id: null, orders: { $sum: 1 }, revenue: { $sum: '$totalPrice' } } },
        ]);

        return { orders: rows[0]?.orders ?? 0, revenue: round2(rows[0]?.revenue ?? 0) };
    }

    async getSoldProductIds(range: IResolvedRange): Promise<string[]> {
        const ids = await this.orderDB.distinct('items.product', {
            status: { $in: REVENUE_STATUSES },
            ...this.dateFilter(range),
        });

        return ids.map((id) => String(id));
    }

    async countOrders(range: IResolvedRange): Promise<number> {
        return this.orderDB.countDocuments({
            status: { $in: REVENUE_STATUSES },
            ...this.dateFilter(range),
        });
    }

    /** Half-open on purpose: `$lte` on a day boundary drops or duplicates a tick. */
    private dateFilter(range?: IResolvedRange | null) {
        if (!range) return {};

        return { createdAt: { $gte: range.from, $lt: range.toExclusive } };
    }
}
