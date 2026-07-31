import { Injectable } from "@nestjs/common";
import { InjectModel } from "@nestjs/mongoose";
import { Model } from "mongoose";
// The combo module's aggregate is reused here on purpose: price and stock are
// derived from the components, and a second copy of that arithmetic is the one
// thing that would let a sale charge something the catalogue does not show.
import { ComboModel } from "../../../../combo/domain/models/combo.model";
import { Combo } from "../../../../core/infrastructure/mongo/schemas/public/combo.schema";
import { IComboRepository } from "../../../domain/repositories/combo.interface.repository";
import { IOrderCombo } from "../../../domain/types/order.type";

@Injectable()
export class ComboRepository implements IComboRepository {
    constructor(
        @InjectModel('Combo') private readonly comboDB: Model<Combo>
    ) { }

    async findById(id: string): Promise<IOrderCombo | null> {
        const combo = await this.comboDB
            .findById(id)
            .populate({ path: 'items.product', select: 'name price stock isActive' });

        if (!combo) return null;

        const model = ComboModel.hydrate(combo);

        return {
            _id: String(combo._id),
            name: model.name,
            price: model.price,
            stock: model.stock,
            isActive: model.isActive && model.hasAllComponentsAvailable,
            // Per single combo, which is what the order line snapshots.
            components: model.items.map((item) => ({
                product: { _id: item.productId },
                name: item.product?.name ?? '',
                quantity: item.quantity,
                unitPrice: item.product?.price ?? 0,
            })),
        };
    }
}
