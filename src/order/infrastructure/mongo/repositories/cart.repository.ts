import { Injectable } from "@nestjs/common";
import { InjectModel } from "@nestjs/mongoose";
import { Model } from "mongoose";
import { Cart } from "../../../../core/infrastructure/mongo/schemas/public/cart.schema";
import { OrderItemType } from "../../../domain/enum/order-item-type.enum";
import { ICartRepository } from "../../../domain/repositories/cart.interface.repository";
import { IOrderCart } from "../../../domain/types/order.type";

@Injectable()
export class CartRepository implements ICartRepository {
    constructor(
        @InjectModel('Cart') private readonly cartDB: Model<Cart>
    ) { }

    async findByUser(userId: string): Promise<IOrderCart | null> {
        const cart = await this.cartDB.findOne({ user: userId }).select('items couponCode').lean();

        if (!cart) return null;

        return {
            _id: String(cart._id),
            couponCode: cart.couponCode ?? undefined,
            items: (cart.items ?? []).map((item) => {
                // Lines written before combos existed carry no itemType at all, so a
                // missing value has to read as PRODUCT rather than as "unknown".
                const itemType = (item.itemType as OrderItemType) ?? OrderItemType.PRODUCT;

                return itemType === OrderItemType.COMBO
                    ? { itemType, comboId: String((item.combo as any)?._id ?? item.combo), quantity: item.quantity }
                    : { itemType, productId: String((item.product as any)?._id ?? item.product), quantity: item.quantity };
            }),
        };
    }

    async clear(cartId: string): Promise<void> {
        await this.cartDB.updateOne({ _id: cartId }, { items: [], totalPrice: 0 });
    }
}
