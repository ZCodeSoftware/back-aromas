import { HttpStatus, Injectable } from "@nestjs/common";
import { InjectModel } from "@nestjs/mongoose";
import { Model } from "mongoose";
import { BaseErrorException } from "../../../../core/domain/exceptions/base.error.exception";
import { CartModel } from "../../../domain/models/cart.model";
import { ICartRepository } from "../../../domain/repositories/cart.interface.repository";
import { CartSchema } from "../schemas/cart.schema";

const CART_POPULATE = [
    { path: 'items.product', select: 'name price stock images isActive' },
    // The combo's own price and stock are derived, so only its display fields are
    // pulled here; the authoritative figures come from the combo repository.
    { path: 'items.combo', select: 'name images isActive' },
];

@Injectable()
export class CartRepository implements ICartRepository {
    constructor(
        @InjectModel('Cart') private readonly cartDB: Model<CartSchema>
    ) { }

    async create(cart: CartModel): Promise<CartModel> {
        const schema = new this.cartDB(cart.toJSON());
        const newCart = await schema.save();

        if (!newCart) throw new BaseErrorException(`Cart shouldn't be created`, HttpStatus.BAD_REQUEST);

        await newCart.populate(CART_POPULATE);

        return CartModel.hydrate(newCart);
    }

    async findByUser(userId: string): Promise<CartModel | null> {
        const cart = await this.cartDB.findOne({ user: userId }).populate(CART_POPULATE);
        if (!cart) return null;
        return CartModel.hydrate(cart);
    }

    async update(cart: CartModel): Promise<CartModel> {
        const { items, totalPrice, couponCode } = cart.toJSON();

        const updatedCart = await this.cartDB
            .findByIdAndUpdate(
                cart.id.toString(),
                // $set with an explicit null so clearing the coupon actually clears it:
                // Mongoose drops undefined keys from an update instead of unsetting them.
                { $set: { items, totalPrice, couponCode } },
                { new: true },
            )
            .populate(CART_POPULATE);

        if (!updatedCart) {
            throw new BaseErrorException('Cart not found', HttpStatus.NOT_FOUND);
        }

        return CartModel.hydrate(updatedCart);
    }
}
