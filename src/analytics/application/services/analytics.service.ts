import { Inject, Injectable } from "@nestjs/common";
import SymbolsOrder from "../../../order/symbols-order";
import { ICatalogueRepository } from "../../domain/repositories/catalogue.interface.repository";
import { IMetricsRepository } from "../../domain/repositories/metrics.interface.repository";
import { IOrderRepository } from "../../domain/repositories/order.interface.repository";
import { IAnalyticsService } from "../../domain/services/analytics.interface.service";
import { IDashboard, IProductMetrics } from "../../domain/types/analytics.type";
import SymbolsAnalytics from "../../symbols-analytics";

const TOP_LIMIT = 5;

@Injectable()
export class AnalyticsService implements IAnalyticsService {
    constructor(
        @Inject(SymbolsAnalytics.IMetricsRepository)
        private readonly metricsRepository: IMetricsRepository,
        @Inject(SymbolsOrder.IOrderRepository)
        private readonly orderRepository: IOrderRepository,
        @Inject(SymbolsAnalytics.ICatalogueRepository)
        private readonly catalogueRepository: ICatalogueRepository,
    ) { }

    async getDashboard(): Promise<IDashboard> {
        const [totalProducts, totalUsers, sales, topViewed, topAddedToCart] = await Promise.all([
            this.catalogueRepository.countProducts(),
            this.catalogueRepository.countUsers(),
            this.orderRepository.getSalesSummary(TOP_LIMIT),
            this.metricsRepository.topBy('seeTimes', TOP_LIMIT),
            this.metricsRepository.topBy('addCartTimes', TOP_LIMIT),
        ]);

        return {
            catalogue: { totalProducts, totalUsers },
            sales,
            engagement: { topViewed, topAddedToCart },
        };
    }

    async getProductMetrics(productId: string): Promise<IProductMetrics> {
        return this.metricsRepository.findByProduct(productId);
    }
}
