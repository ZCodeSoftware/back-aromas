import { Injectable } from "@nestjs/common";
import { InjectModel } from "@nestjs/mongoose";
import { Model } from "mongoose";
import { round2 } from "../../../../core/domain/utils/money.util";
import { Cart } from "../../../../core/infrastructure/mongo/schemas/public/cart.schema";
import { IAnalyticsCartRepository } from "../../../domain/repositories/cart.interface.repository";
import { ICartSnapshot } from "../../../domain/types/analytics.type";

/** `items.0` existing is the index-friendly way to ask for a non-empty array. */
const HAS_ITEMS = { 'items.0': { $exists: true } };

@Injectable()
export class CartRepository implements IAnalyticsCartRepository {
    constructor(
        @InjectModel('Cart') private readonly cartDB: Model<Cart>
    ) { }

    async getCartSnapshot(cutoff: Date): Promise<ICartSnapshot> {
        // A cart that reached checkout was emptied, so it cannot show up here:
        // holding items is what makes one a candidate.
        const abandonedFilter = { ...HAS_ITEMS, updatedAt: { $lt: cutoff } };

        const [cartsWithItems, abandonedCarts, value] = await Promise.all([
            this.cartDB.countDocuments(HAS_ITEMS),
            this.cartDB.countDocuments(abandonedFilter),
            this.cartDB.aggregate([
                { $match: abandonedFilter },
                { $group: { _id: null, value: { $sum: '$totalPrice' } } },
            ]),
        ]);

        return {
            cartsWithItems,
            abandonedCarts,
            abandonedValueAtCartPrices: round2(value[0]?.value ?? 0),
        };
    }
}
