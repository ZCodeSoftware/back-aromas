import { Injectable } from "@nestjs/common";
import { InjectModel } from "@nestjs/mongoose";
import { Model } from "mongoose";
import { round2 } from "../../../../core/domain/utils/money.util";
import { Product } from "../../../../core/infrastructure/mongo/schemas/public/product.schema";
import { IInventoryRepository } from "../../../domain/repositories/inventory.interface.repository";
import { IStockProduct, IStockSummary } from "../../../domain/types/analytics.type";

const STOCK_FIELDS = 'name price stock images';

/**
 * Note on field names: aggregation pipelines bypass Mongoose path mapping, and the
 * stored field really is `isActive` — the `name: 'is_active'` in the schema
 * decorator is not a Mongoose option and has no effect.
 */
@Injectable()
export class InventoryRepository implements IInventoryRepository {
    constructor(
        @InjectModel('Product') private readonly productDB: Model<Product>
    ) { }

    async getStockSummary(lowStockThreshold: number): Promise<IStockSummary> {
        const rows = await this.productDB.aggregate([
            { $match: { isActive: true } },
            {
                $group: {
                    _id: null,
                    activeProducts: { $sum: 1 },
                    unitsInStock: { $sum: '$stock' },
                    inventoryValueAtSalePrice: { $sum: { $multiply: ['$price', '$stock'] } },
                    // $lte rather than $eq: the schema has min 0, but be defensive.
                    outOfStockCount: { $sum: { $cond: [{ $lte: ['$stock', 0] }, 1, 0] } },
                    lowStockCount: {
                        $sum: {
                            $cond: [
                                {
                                    $and: [
                                        { $gt: ['$stock', 0] },
                                        { $lte: ['$stock', lowStockThreshold] },
                                    ],
                                },
                                1,
                                0,
                            ],
                        },
                    },
                },
            },
        ]);

        const row = rows[0];

        return {
            activeProducts: row?.activeProducts ?? 0,
            unitsInStock: row?.unitsInStock ?? 0,
            inventoryValueAtSalePrice: round2(row?.inventoryValueAtSalePrice ?? 0),
            outOfStockCount: row?.outOfStockCount ?? 0,
            lowStockCount: row?.lowStockCount ?? 0,
        };
    }

    async findLowStock(lowStockThreshold: number, limit: number): Promise<IStockProduct[]> {
        const rows = await this.productDB
            .find({ isActive: true, stock: { $gt: 0, $lte: lowStockThreshold } })
            .select(STOCK_FIELDS)
            .sort({ stock: 1 })
            .limit(limit)
            .lean();

        return rows.map((row) => this.toStockProduct(row));
    }

    async findOutOfStock(limit: number): Promise<IStockProduct[]> {
        const rows = await this.productDB
            .find({ isActive: true, stock: { $lte: 0 } })
            .select(STOCK_FIELDS)
            .sort({ updatedAt: -1 })
            .limit(limit)
            .lean();

        return rows.map((row) => this.toStockProduct(row));
    }

    async findDeadStock(soldProductIds: string[], limit: number): Promise<IStockProduct[]> {
        const rows = await this.productDB
            .find(this.deadStockFilter(soldProductIds))
            .select(STOCK_FIELDS)
            // Most capital tied up first. Not updatedAt, which moves on any edit
            // including a price tweak, so it is a poor staleness signal.
            .sort({ stock: -1 })
            .limit(limit)
            .lean();

        return rows.map((row) => this.toStockProduct(row));
    }

    async getDeadStockTotals(soldProductIds: string[]): Promise<{ count: number; valueAtSalePrice: number }> {
        const rows = await this.productDB.aggregate([
            { $match: this.deadStockFilter(soldProductIds) },
            {
                $group: {
                    _id: null,
                    count: { $sum: 1 },
                    valueAtSalePrice: { $sum: { $multiply: ['$price', '$stock'] } },
                },
            },
        ]);

        return {
            count: rows[0]?.count ?? 0,
            valueAtSalePrice: round2(rows[0]?.valueAtSalePrice ?? 0),
        };
    }

    private deadStockFilter(soldProductIds: string[]) {
        return { isActive: true, stock: { $gt: 0 }, _id: { $nin: soldProductIds } };
    }

    private toStockProduct(row: any): IStockProduct {
        return {
            _id: String(row._id),
            name: row.name,
            price: row.price ?? 0,
            stock: row.stock ?? 0,
            images: row.images,
        };
    }
}
