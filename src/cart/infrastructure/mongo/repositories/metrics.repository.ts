import { Injectable } from "@nestjs/common";
import { InjectModel } from "@nestjs/mongoose";
import { Model } from "mongoose";
import { Metrics } from "../../../../core/infrastructure/mongo/schemas/public/metrics.schema";
import { IMetricsRepository } from "../../../domain/repositories/metrics.interface.repository";

@Injectable()
export class MetricsRepository implements IMetricsRepository {
    constructor(
        @InjectModel('Metrics') private readonly metricsDB: Model<Metrics>
    ) { }

    async incrementAddCartTimes(productId: string): Promise<void> {
        await this.metricsDB.updateOne({ product: productId }, { $inc: { addCartTimes: 1 } }, { upsert: true });
    }
}
