import { Injectable } from "@nestjs/common";
import { InjectModel } from "@nestjs/mongoose";
import { Model } from "mongoose";
import { IMetricsRepository } from "../../../domain/repositories/metrics.interface.repository";
import { ILifetimeCounters, IProductMetrics, ITopProduct } from "../../../domain/types/analytics.type";
import { MetricsSchema } from "../schemas/metrics.schema";

@Injectable()
export class MetricsRepository implements IMetricsRepository {
    constructor(
        @InjectModel('Metrics') private readonly metricsDB: Model<MetricsSchema>
    ) { }

    async incrementSeeTimes(productId: string): Promise<void> {
        await this.increment(productId, 'seeTimes', 1);
    }

    async incrementAddCartTimes(productId: string): Promise<void> {
        await this.increment(productId, 'addCartTimes', 1);
    }

    async incrementSellTimes(productId: string, quantity: number): Promise<void> {
        await this.increment(productId, 'sellTimes', quantity);
    }

    async findByProduct(productId: string): Promise<IProductMetrics> {
        const metrics = await this.metricsDB
            .findOne({ product: productId })
            .populate({ path: 'product', select: 'name _id' })
            .lean();

        if (!metrics) {
            // No events recorded yet is a legitimate answer, not a 404.
            return { product: { _id: String(productId) }, seeTimes: 0, sellTimes: 0, addCartTimes: 0 };
        }

        return {
            product: this.toProductRef(metrics.product),
            seeTimes: metrics.seeTimes,
            sellTimes: metrics.sellTimes,
            addCartTimes: metrics.addCartTimes,
        };
    }

    async topBy(field: 'seeTimes' | 'addCartTimes' | 'sellTimes', limit: number): Promise<ITopProduct[]> {
        const rows = await this.metricsDB
            .find({ [field]: { $gt: 0 } })
            .populate({ path: 'product', select: 'name _id' })
            .sort({ [field]: -1 })
            .limit(limit)
            .lean();

        return rows.map((row) => ({
            product: this.toProductRef(row.product),
            value: row[field] as number,
        }));
    }

    async getLifetimeTotals(): Promise<ILifetimeCounters> {
        const rows = await this.metricsDB.aggregate([
            {
                $group: {
                    _id: null,
                    seeTimes: { $sum: '$seeTimes' },
                    sellTimes: { $sum: '$sellTimes' },
                    addCartTimes: { $sum: '$addCartTimes' },
                },
            },
        ]);

        return {
            seeTimes: rows[0]?.seeTimes ?? 0,
            sellTimes: rows[0]?.sellTimes ?? 0,
            addCartTimes: rows[0]?.addCartTimes ?? 0,
        };
    }

    /** Upsert so the very first event creates the counter document. */
    private async increment(productId: string, field: string, amount: number): Promise<void> {
        await this.metricsDB.updateOne(
            { product: productId },
            { $inc: { [field]: amount } },
            { upsert: true },
        );
    }

    private toProductRef(product: any) {
        if (!product) return { _id: null };
        return { _id: String(product._id ?? product), name: product.name };
    }
}
