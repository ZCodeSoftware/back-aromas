import { HttpStatus, Injectable } from "@nestjs/common";
import { InjectModel } from "@nestjs/mongoose";
import { Model } from "mongoose";
import { BaseErrorException } from "../../../../core/domain/exceptions/base.error.exception";
import { PaginatedResponse } from "../../../../core/domain/response/find-all-paginated.response";
import { PromotionModel } from "../../../domain/models/promotion.model";
import { IPromotionRepository } from "../../../domain/repositories/promotion.interface.repository";
import { IPromotionFilterOptions } from "../../../domain/types/promotion.type";
import { PromotionSchema } from "../schemas/promotion.schema";

/** Enough to render the scope of a promotion in the dashboard listings. */
const SCOPE_POPULATE = [
    { path: 'categories', select: 'name _id' },
    { path: 'subCategories', select: 'name _id' },
    { path: 'products', select: 'name _id' },
    { path: 'combos', select: 'name _id' },
];

@Injectable()
export class PromotionRepository implements IPromotionRepository {
    constructor(
        @InjectModel('Promotion') private readonly promotionDB: Model<PromotionSchema>
    ) { }

    async create(promotion: PromotionModel): Promise<PromotionModel> {
        const schema = new this.promotionDB(this.toDocument(promotion));
        const created = await schema.save();

        if (!created) {
            throw new BaseErrorException(`Promotion shouldn't be created`, HttpStatus.BAD_REQUEST);
        }

        return this.findById(String(created._id));
    }

    async findById(id: string): Promise<PromotionModel> {
        const promotion = await this.promotionDB.findById(id).populate(SCOPE_POPULATE);

        if (!promotion) throw new BaseErrorException('Promotion not found', HttpStatus.NOT_FOUND);

        return PromotionModel.hydrate(promotion);
    }

    async findAll(options: IPromotionFilterOptions = {}): Promise<PaginatedResponse<PromotionModel>> {
        const { page = 1, limit = 10, search, isActive, includeInactive } = options;

        const currentPage = Math.max(1, page);
        const itemsPerPage = Math.min(Math.max(1, limit), 100);
        const skip = (currentPage - 1) * itemsPerPage;

        const filters: any = {};

        // Soft-deleted promotions stay out unless explicitly asked for: either
        // filtered on their own or listed next to the active ones (the admin view).
        if (isActive !== undefined) {
            filters.isActive = isActive;
        } else if (!includeInactive) {
            filters.isActive = true;
        }

        if (search) {
            filters.$or = [
                { name: { $regex: search, $options: 'i' } },
                { code: { $regex: search, $options: 'i' } },
            ];
        }

        const totalItems = await this.promotionDB.countDocuments(filters);
        const totalPages = Math.ceil(totalItems / itemsPerPage);

        const promotions = await this.promotionDB
            .find(filters)
            .populate(SCOPE_POPULATE)
            .skip(skip)
            .limit(itemsPerPage)
            .sort({ createdAt: -1 });

        return {
            data: promotions.map((promotion) => PromotionModel.hydrate(promotion)),
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
     * The automatic promotions in force at `when`. Both ends of the window are
     * optional, so an absent date has to count as "no bound" rather than as a
     * failed comparison — hence the $or against $exists.
     */
    async findActiveAutomatic(when: Date): Promise<PromotionModel[]> {
        const promotions = await this.promotionDB.find({
            isActive: true,
            $and: [
                { $or: [{ code: { $exists: false } }, { code: null }] },
                { $or: [{ startsAt: { $exists: false } }, { startsAt: null }, { startsAt: { $lte: when } }] },
                { $or: [{ endsAt: { $exists: false } }, { endsAt: null }, { endsAt: { $gte: when } }] },
            ],
        });

        return promotions.map((promotion) => PromotionModel.hydrate(promotion));
    }

    async findByCode(code: string): Promise<PromotionModel | null> {
        // Anchored and case-insensitive: the field is stored uppercase, but a
        // document written before that was enforced would otherwise never match.
        const promotion = await this.promotionDB.findOne({
            code: { $regex: `^${escapeRegExp(code)}$`, $options: 'i' },
        });

        return promotion ? PromotionModel.hydrate(promotion) : null;
    }

    async update(id: string, promotion: PromotionModel): Promise<PromotionModel> {
        const document = this.toDocument(promotion);

        // Mongoose drops undefined keys instead of clearing them, so removing a
        // coupon code or an end date needs an explicit $unset.
        const unset = Object.fromEntries(
            ['code', 'startsAt', 'endsAt', 'minPurchase', 'usageLimit', 'usageLimitPerUser']
                .filter((field) => document[field] === undefined || document[field] === null)
                .map((field) => [field, '']),
        );

        const updated = await this.promotionDB.findByIdAndUpdate(
            id,
            Object.keys(unset).length ? { $set: document, $unset: unset } : { $set: document },
            { new: true },
        );

        if (!updated) throw new BaseErrorException('Promotion not found', HttpStatus.NOT_FOUND);

        return this.findById(id);
    }

    async softDelete(id: string): Promise<PromotionModel> {
        const promotion = await this.promotionDB
            .findByIdAndUpdate(id, { isActive: false }, { new: true })
            .populate(SCOPE_POPULATE);

        if (!promotion) throw new BaseErrorException('Promotion not found', HttpStatus.NOT_FOUND);

        return PromotionModel.hydrate(promotion);
    }

    /**
     * The guard in the filter is what makes this safe under concurrency: two
     * simultaneous checkouts cannot both take the last use of a coupon, the same
     * way the stock decrement guards on `$gte`.
     */
    async consumeUse(id: string): Promise<boolean> {
        const result = await this.promotionDB.updateOne(
            {
                _id: id,
                $or: [
                    { usageLimit: { $exists: false } },
                    { usageLimit: null },
                    { $expr: { $lt: ['$usedCount', '$usageLimit'] } },
                ],
            },
            { $inc: { usedCount: 1 } },
        );

        return result.modifiedCount === 1;
    }

    async releaseUse(id: string): Promise<void> {
        // Floored at zero so a double release can never drive the counter negative.
        await this.promotionDB.updateOne(
            { _id: id, usedCount: { $gt: 0 } },
            { $inc: { usedCount: -1 } },
        );
    }

    /** Strips what the model derives and flattens the reference lists to ids. */
    private toDocument(promotion: PromotionModel) {
        const { _id, createdAt, updatedAt, ...rest } = promotion.toJSON() as any;

        return {
            ...rest,
            code: rest.code ?? undefined,
            startsAt: rest.startsAt ?? undefined,
            endsAt: rest.endsAt ?? undefined,
        };
    }
}

/** A coupon code is user input; without this a `.` or `*` in it would widen the match. */
const escapeRegExp = (value: string): string => value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
