import { Injectable } from "@nestjs/common";
import { InjectModel } from "@nestjs/mongoose";
import { Model } from "mongoose";
import { Cart } from "../../../../core/infrastructure/mongo/schemas/public/cart.schema";
import { ICartRepository } from "../../../domain/repositories/cart.interface.repository";
import { IOrderCart } from "../../../domain/types/order.type";

@Injectable()
export class CartRepository implements ICartRepository {
    constructor(
        @InjectModel('Cart') private readonly cartDB: Model<Cart>
    ) { }

    async findByUser(userId: string): Promise<IOrderCart | null> {
        const cart = await this.cartDB.findOne({ user: userId }).select('items').lean();

        if (!cart) return null;

        return {
            _id: String(cart._id),
            items: (cart.items ?? []).map((item) => ({
                productId: String((item.product as any)?._id ?? item.product),
                quantity: item.quantity,
            })),
        };
    }

    async clear(cartId: string): Promise<void> {
        await this.cartDB.updateOne({ _id: cartId }, { items: [], totalPrice: 0 });
    }
}
