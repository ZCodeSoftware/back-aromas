import { Injectable } from "@nestjs/common";
import { InjectModel } from "@nestjs/mongoose";
import { Model } from "mongoose";
// The combo module's aggregate is reused here on purpose: price and stock are
// derived from the components, and a second copy of that arithmetic is the one
// thing that would let the cart and the catalogue disagree on what a combo costs.
import { ComboModel } from "../../../../combo/domain/models/combo.model";
import { Combo } from "../../../../core/infrastructure/mongo/schemas/public/combo.schema";
import { IComboRepository } from "../../../domain/repositories/combo.interface.repository";
import { ICartCombo } from "../../../domain/types/cart.type";

@Injectable()
export class ComboRepository implements IComboRepository {
    constructor(
        @InjectModel('Combo') private readonly comboDB: Model<Combo>
    ) { }

    async findById(id: string): Promise<ICartCombo | null> {
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
            isActive: model.isActive,
            hasAllComponentsAvailable: model.hasAllComponentsAvailable,
        };
    }
}
