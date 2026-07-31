import { HttpStatus, Injectable } from "@nestjs/common";
import { InjectModel } from "@nestjs/mongoose";
import { Model } from "mongoose";
import { BaseErrorException } from "../../../../core/domain/exceptions/base.error.exception";
import { PaginatedResponse } from "../../../../core/domain/response/find-all-paginated.response";
import { ComboModel } from "../../../domain/models/combo.model";
import { IComboRepository } from "../../../domain/repositories/combo.interface.repository";
import { IComboFilterOptions } from "../../../domain/types/combo.type";
import { ComboSchema } from "../schemas/combo.schema";

/** Without the components there is no price and no stock, so every read populates them. */
const ITEM_PRODUCT_POPULATE = {
    path: 'items.product',
    select: 'name price stock isActive images',
};

@Injectable()
export class ComboRepository implements IComboRepository {
    constructor(
        @InjectModel('Combo') private readonly comboDB: Model<ComboSchema>
    ) { }

    async create(combo: ComboModel): Promise<ComboModel> {
        const schema = new this.comboDB(this.toDocument(combo));
        const newCombo = await schema.save();

        if (!newCombo) throw new BaseErrorException(`Combo shouldn't be created`, HttpStatus.BAD_REQUEST);

        return this.findById(String(newCombo._id));
    }

    async findById(id: string): Promise<ComboModel> {
        const combo = await this.comboDB.findById(id).populate(ITEM_PRODUCT_POPULATE);

        if (!combo) throw new BaseErrorException('Combo not found', HttpStatus.NOT_FOUND);

        return ComboModel.hydrate(combo);
    }

    /**
     * Paginated in memory rather than with skip/limit. Stock and price are derived
     * from the components, so `hasStock` cannot be expressed as a Mongo filter and
     * a database-side count would disagree with the rows actually returned. Combos
     * are a curated, small collection, which is what makes this affordable.
     */
    async findAll(options: IComboFilterOptions = {}): Promise<PaginatedResponse<ComboModel>> {
        const { page = 1, limit = 10, search, isActive, includeInactive, hasStock } = options;

        const currentPage = Math.max(1, page);
        const itemsPerPage = Math.min(Math.max(1, limit), 100);
        const skip = (currentPage - 1) * itemsPerPage;

        const filters: any = {};

        // Soft-deleted combos stay out unless explicitly asked for: either filtered
        // on their own (isActive) or listed next to the active ones (the admin view).
        if (isActive !== undefined) {
            filters.isActive = isActive;
        } else if (!includeInactive) {
            filters.isActive = true;
        }

        if (search) {
            filters.$or = [
                { name: { $regex: search, $options: 'i' } },
                { description: { $regex: search, $options: 'i' } },
            ];
        }

        const combos = await this.comboDB
            .find(filters)
            .populate(ITEM_PRODUCT_POPULATE)
            .sort({ createdAt: -1 });

        let data = combos.map((combo) => ComboModel.hydrate(combo));

        if (hasStock !== undefined) {
            data = data.filter((combo) => (hasStock ? combo.stock > 0 : combo.stock <= 0));
        }

        const totalItems = data.length;
        const totalPages = Math.ceil(totalItems / itemsPerPage);

        return {
            data: data.slice(skip, skip + itemsPerPage),
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

    async update(id: string, combo: ComboModel): Promise<ComboModel> {
        const document = this.toDocument(combo);

        // The model blanks whichever price field its mode ignores, but Mongoose drops
        // undefined keys from an update instead of clearing them. Without the $unset a
        // combo switched from FIXED to PERCENTAGE would keep its old fixedPrice on disk.
        const unset = Object.fromEntries(
            ['fixedPrice', 'discountPercentage']
                .filter((field) => document[field] === undefined)
                .map((field) => [field, '']),
        );

        const updated = await this.comboDB.findByIdAndUpdate(
            id,
            Object.keys(unset).length ? { $set: document, $unset: unset } : { $set: document },
            { new: true },
        );

        if (!updated) throw new BaseErrorException('Combo not found', HttpStatus.NOT_FOUND);

        return this.findById(id);
    }

    async softDelete(id: string): Promise<ComboModel> {
        const combo = await this.comboDB
            .findByIdAndUpdate(id, { isActive: false }, { new: true })
            .populate(ITEM_PRODUCT_POPULATE);

        if (!combo) throw new BaseErrorException('Combo not found', HttpStatus.NOT_FOUND);

        return ComboModel.hydrate(combo);
    }

    /**
     * Strips the derived fields the model emits for the API and flattens the
     * populated components back to bare ids, so neither a stale price nor a whole
     * product document is ever written into the combo.
     */
    private toDocument(combo: ComboModel) {
        const { price, compareAtPrice, savings, stock, items, createdAt, updatedAt, _id, ...rest } =
            combo.toJSON() as any;

        return {
            ...rest,
            items: (items ?? []).map((item: any) => ({
                product: item.product?._id ?? item.product,
                quantity: item.quantity,
            })),
        };
    }
}
