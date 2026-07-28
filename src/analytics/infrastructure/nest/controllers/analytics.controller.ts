import { Controller, Get, HttpCode, Inject, Param, Query, UseGuards } from "@nestjs/common";
import { ApiOperation, ApiResponse, ApiTags } from "@nestjs/swagger";
import { Roles } from "../../../../auth/infrastructure/nest/decorators/roles.decorator";
import { AuthGuards } from "../../../../auth/infrastructure/nest/guards/auth.guard";
import { RoleGuards } from "../../../../auth/infrastructure/nest/guards/role.guard";
import { TypeRoles } from "../../../../core/domain/enums/type-roles.enum";
import { IAnalyticsService } from "../../../domain/services/analytics.interface.service";
import SymbolsAnalytics from "../../../symbols-analytics";
import {
    ConversionQueryDTO,
    CustomersQueryDTO,
    DashboardQueryDTO,
    InventoryQueryDTO,
    SalesTimeSeriesDTO,
} from "../dtos/analytics-query.dto";

/**
 * Split into focused endpoints rather than one payload: the customer cohorts and
 * the dead-stock anti-join scan whole collections, and on a cold start a single
 * fat request would make the KPI header wait for them.
 */
@ApiTags('analytics')
@Controller('analytics')
export class AnalyticsController {
    constructor(
        @Inject(SymbolsAnalytics.IAnalyticsService)
        private readonly analyticsService: IAnalyticsService
    ) { }

    @Get('dashboard')
    @HttpCode(200)
    @UseGuards(AuthGuards, RoleGuards)
    @Roles(TypeRoles.ADMIN)
    @ApiOperation({
        summary: 'Overview',
        description:
            'Catalogue totals, sales summary and engagement rankings. Omitting both dates reports all time, which is the original behaviour. `revenue` counts every order that was not cancelled or refunded, PENDING included; use `paidRevenue` for money actually taken. `catalogue` and `engagement` are never range-filtered.',
    })
    @ApiResponse({ status: 200, description: 'Catalogue totals, sales summary and engagement rankings' })
    @ApiResponse({ status: 400, description: 'Invalid date range' })
    @ApiResponse({ status: 401, description: 'Unauthorized' })
    @ApiResponse({ status: 403, description: 'Admin role required' })
    async getDashboard(@Query() query: DashboardQueryDTO) {
        return this.analyticsService.getDashboard(query);
    }

    @Get('product/:productId')
    @HttpCode(200)
    @UseGuards(AuthGuards, RoleGuards)
    @Roles(TypeRoles.ADMIN)
    @ApiResponse({ status: 401, description: 'Unauthorized' })
    @ApiResponse({ status: 403, description: 'Admin role required' })
    @ApiResponse({ status: 200, description: 'Counters of a product. Returns zeros when it has no events yet' })
    async getProductMetrics(@Param('productId') productId: string) {
        return this.analyticsService.getProductMetrics(productId);
    }

    @Get('sales/timeseries')
    @HttpCode(200)
    @UseGuards(AuthGuards, RoleGuards)
    @Roles(TypeRoles.ADMIN)
    @ApiOperation({
        summary: 'Sales over time',
        description:
            'Orders, revenue and average ticket per bucket. Buckets with no sales are returned as zeros so a chart needs no gap filling. `partial` marks an edge bucket that extends outside the range. Totals are summed from the raw days, so they will not always equal the sum of the rounded buckets.',
    })
    @ApiResponse({ status: 200, description: 'Bucketed series plus totals for the range' })
    @ApiResponse({ status: 400, description: 'Invalid date range' })
    @ApiResponse({ status: 401, description: 'Unauthorized' })
    @ApiResponse({ status: 403, description: 'Admin role required' })
    async getSalesTimeSeries(@Query() query: SalesTimeSeriesDTO) {
        return this.analyticsService.getSalesTimeSeries(query);
    }

    @Get('sales/breakdown')
    @HttpCode(200)
    @UseGuards(AuthGuards, RoleGuards)
    @Roles(TypeRoles.ADMIN)
    @ApiOperation({
        summary: 'Sales by channel and payment method',
        description:
            'Marginals plus the channel x payment-method matrix, which is what reconciling the till needs. ONLINE includes orders created before the channel field existed. POS rows always have no shipping cost, so their revenue equals their subtotal. Rounded shares may sum to 99.99 or 100.01 rather than exactly 100.',
    })
    @ApiResponse({ status: 200, description: 'Revenue split by channel, by payment method, and per cell' })
    @ApiResponse({ status: 400, description: 'Invalid date range' })
    @ApiResponse({ status: 401, description: 'Unauthorized' })
    @ApiResponse({ status: 403, description: 'Admin role required' })
    async getSalesBreakdown(@Query() query: DashboardQueryDTO) {
        return this.analyticsService.getSalesBreakdown(query);
    }

    @Get('inventory')
    @HttpCode(200)
    @UseGuards(AuthGuards, RoleGuards)
    @Roles(TypeRoles.ADMIN)
    @ApiOperation({
        summary: 'Stock health',
        description:
            'Summary, low-stock and out-of-stock lists are point-in-time and ignore the date range; only `deadStock` uses it, and carries its own copy of it. Valuation is at sale price, not cost: products have no cost field. `deadStock.count` and `valueAtSalePrice` cover the whole set, while `items` is capped by `limit`.',
    })
    @ApiResponse({ status: 200, description: 'Stock summary, actionable lists and dead stock' })
    @ApiResponse({ status: 400, description: 'Invalid date range' })
    @ApiResponse({ status: 401, description: 'Unauthorized' })
    @ApiResponse({ status: 403, description: 'Admin role required' })
    async getInventory(@Query() query: InventoryQueryDTO) {
        return this.analyticsService.getInventory(query);
    }

    @Get('customers')
    @HttpCode(200)
    @UseGuards(AuthGuards, RoleGuards)
    @Roles(TypeRoles.ADMIN)
    @ApiOperation({
        summary: 'Customers',
        description:
            'Top customers by revenue, new versus returning, and the anonymous counter sales that belong to neither. A customer is new when their first-ever revenue order falls inside the range, which is why the cohort figures read the whole order history.',
    })
    @ApiResponse({ status: 200, description: 'Leaderboard, cohorts and the anonymous block' })
    @ApiResponse({ status: 400, description: 'Invalid date range' })
    @ApiResponse({ status: 401, description: 'Unauthorized' })
    @ApiResponse({ status: 403, description: 'Admin role required' })
    async getCustomers(@Query() query: CustomersQueryDTO) {
        return this.analyticsService.getCustomers(query);
    }

    @Get('conversion')
    @HttpCode(200)
    @UseGuards(AuthGuards, RoleGuards)
    @Roles(TypeRoles.ADMIN)
    @ApiOperation({
        summary: 'Carts and funnel components',
        description:
            'There is no defensible range-scoped funnel in this schema, so no single conversion rate is reported. Each block carries its own `scope`: carts are a SNAPSHOT (one cart per registered user, mutated in place, emptied on checkout, and guests have no cart at all), orders are RANGE, and the add-to-cart rate is LIFETIME because the counters hold no per-event timestamp.',
    })
    @ApiResponse({ status: 200, description: 'Cart snapshot, orders in range and lifetime rates' })
    @ApiResponse({ status: 400, description: 'Invalid date range' })
    @ApiResponse({ status: 401, description: 'Unauthorized' })
    @ApiResponse({ status: 403, description: 'Admin role required' })
    async getConversion(@Query() query: ConversionQueryDTO) {
        return this.analyticsService.getConversion(query);
    }
}
