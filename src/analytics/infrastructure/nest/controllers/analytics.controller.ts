import { Controller, Get, HttpCode, Inject, Param, UseGuards } from "@nestjs/common";
import { ApiResponse, ApiTags } from "@nestjs/swagger";
import { Roles } from "../../../../auth/infrastructure/nest/decorators/roles.decorator";
import { AuthGuards } from "../../../../auth/infrastructure/nest/guards/auth.guard";
import { RoleGuards } from "../../../../auth/infrastructure/nest/guards/role.guard";
import { TypeRoles } from "../../../../core/domain/enums/type-roles.enum";
import { IAnalyticsService } from "../../../domain/services/analytics.interface.service";
import SymbolsAnalytics from "../../../symbols-analytics";

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
    @ApiResponse({ status: 401, description: 'Unauthorized' })
    @ApiResponse({ status: 403, description: 'Admin role required' })
    @ApiResponse({ status: 200, description: 'Catalogue totals, sales summary and engagement rankings' })
    async getDashboard() {
        return this.analyticsService.getDashboard();
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
}
