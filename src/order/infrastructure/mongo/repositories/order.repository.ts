import { HttpStatus, Inject, Injectable } from "@nestjs/common";
import { InjectModel } from "@nestjs/mongoose";
import { Model } from "mongoose";
import SymbolsCatalogs from "../../../../catalogs/symbols-catalogs";
import { BaseErrorException } from "../../../../core/domain/exceptions/base.error.exception";
import { PaginatedResponse } from "../../../../core/domain/response/find-all-paginated.response";
import { OrderChannel } from "../../../domain/enum/order-channel.enum";
import { PURCHASED_STATUSES } from "../../../domain/enum/order-status.enum";
import { OrderModel } from "../../../domain/models/order.model";
import { ICatOrderStatusRepository } from "../../../domain/repositories/cat-order-status.interface.repository";
import { IOrderRepository } from "../../../domain/repositories/order.interface.repository";
import { IOrderFilterOptions } from "../../../domain/types/order.type";
import { OrderSchema } from "../schemas/order.schema";

/**
 * `status` is populated everywhere on purpose: the state machine reads the code
 * of the catalogue row, so an order hydrated without it could not be moved on.
 */
const ORDER_POPULATE = [
    { path: 'status', select: 'code name _id' },
    { path: 'paymentMethod', select: 'name _id' },
    { path: 'items.product', select: 'name images _id' },
    { path: 'soldBy', select: 'firstName lastName _id' },
];

@Injectable()
export class OrderRepository implements IOrderRepository {
    constructor(
        @InjectModel('Order') private readonly orderDB: Model<OrderSchema>,
        @Inject(SymbolsCatalogs.ICatOrderStatusRepository)
        private readonly catOrderStatusRepository: ICatOrderStatusRepository,
    ) { }

    async create(order: OrderModel): Promise<OrderModel> {
        const schema = new this.orderDB(order.toJSON());
        const newOrder = await schema.save();

        if (!newOrder) throw new BaseErrorException(`Order shouldn't be created`, HttpStatus.BAD_REQUEST);

        await newOrder.populate(ORDER_POPULATE);

        return OrderModel.hydrate(newOrder);
    }

    async findById(id: string): Promise<OrderModel> {
        const order = await this.orderDB.findById(id).populate(ORDER_POPULATE);
        if (!order) throw new BaseErrorException('Order not found', HttpStatus.NOT_FOUND);
        return OrderModel.hydrate(order);
    }

    async findAll(options: IOrderFilterOptions): Promise<PaginatedResponse<OrderModel>> {
        const { page = 1, limit = 10, statusId, userId, dateFrom, dateTo, channel, soldBy } = options;

        const currentPage = Math.max(1, page);
        const itemsPerPage = Math.min(Math.max(1, limit), 100);
        const skip = (currentPage - 1) * itemsPerPage;

        const filters: any = {};
        if (statusId) filters.status = statusId;
        if (userId) filters.user = userId;
        if (soldBy) filters.soldBy = soldBy;
        if (channel === OrderChannel.POS) {
            filters.channel = OrderChannel.POS;
        } else if (channel === OrderChannel.ONLINE) {
            // Orders written before the channel field existed have no such key, and
            // in MongoDB `null` matches a missing field as well as an explicit null.
            filters.channel = { $in: [OrderChannel.ONLINE, null] };
        }
        if (dateFrom || dateTo) {
            filters.createdAt = {};
            if (dateFrom) filters.createdAt.$gte = dateFrom;
            if (dateTo) filters.createdAt.$lte = dateTo;
        }

        const totalItems = await this.orderDB.countDocuments(filters);
        const totalPages = Math.ceil(totalItems / itemsPerPage);

        const orders = await this.orderDB
            .find(filters)
            .populate(ORDER_POPULATE)
            .skip(skip)
            .limit(itemsPerPage)
            .sort({ createdAt: -1 });

        return {
            data: orders?.map((order) => OrderModel.hydrate(order)) || [],
            pagination: {
                currentPage,
                totalPages,
                totalItems,
                itemsPerPage,
                hasNextPage: currentPage < totalPages,
                hasPrevPage: currentPage > 1,
            },
        };
    }

    /**
     * Only the lifecycle fields are writable. Items and prices are a snapshot and
     * must never be rewritten after checkout.
     */
    async update(id: string, order: OrderModel): Promise<OrderModel> {
        const { status, stockRestored } = order.toJSON();

        const updatedOrder = await this.orderDB
            .findByIdAndUpdate(id, { status, stockRestored }, { new: true })
            .populate(ORDER_POPULATE);

        if (!updatedOrder) {
            throw new BaseErrorException('Order not found', HttpStatus.NOT_FOUND);
        }

        return OrderModel.hydrate(updatedOrder);
    }

    async hasPurchasedProduct(userId: string, productId: string): Promise<boolean> {
        const count = await this.orderDB.countDocuments({
            user: userId,
            'items.product': productId,
            status: { $in: await this.catOrderStatusRepository.idsByCodes(PURCHASED_STATUSES) },
        });

        return count > 0;
    }
}
