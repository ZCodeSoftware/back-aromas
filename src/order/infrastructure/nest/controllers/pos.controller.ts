import { Body, Controller, Get, HttpCode, Inject, Param, Patch, Post, Query, UseGuards } from "@nestjs/common";
import { ApiBody, ApiOperation, ApiResponse, ApiTags } from "@nestjs/swagger";
import { Roles } from "../../../../auth/infrastructure/nest/decorators/roles.decorator";
import { AuthGuards } from "../../../../auth/infrastructure/nest/guards/auth.guard";
import { RoleGuards } from "../../../../auth/infrastructure/nest/guards/role.guard";
import { TypeRoles } from "../../../../core/domain/enums/type-roles.enum";
import { CurrentUser } from "../../../../core/infrastructure/nest/decorators/current-user.decorator";
import { IPosService } from "../../../domain/services/pos.interface.service";
import SymbolsOrder from "../../../symbols-order";
import { FilterPosSalesDTO } from "../dtos/filter-order.dto";
import { CreatePosSaleDTO, PreviewPosSaleDTO } from "../dtos/pos-sale.dto";

@ApiTags('pos')
@Controller('pos')
export class PosController {
    constructor(
        @Inject(SymbolsOrder.IPosService)
        private readonly posService: IPosService
    ) { }

    @Post('sale')
    @HttpCode(201)
    @UseGuards(AuthGuards, RoleGuards)
    @Roles(TypeRoles.ADMIN)
    @ApiOperation({
        summary: 'Register a counter sale',
        description:
            'Creates an order already PAID with channel POS, shippingType PICKUP and no shipping cost, and takes the stock. Unit prices always come from the live catalogue. Repeated products in `items` are merged into a single line.',
    })
    @ApiResponse({ status: 201, description: 'Counter sale registered as PAID and stock decremented' })
    @ApiResponse({
        status: 400,
        description: 'Empty items, inactive product, insufficient stock, or both userId and customer supplied',
    })
    @ApiResponse({ status: 401, description: 'Unauthorized' })
    @ApiResponse({ status: 403, description: 'Admin role required' })
    @ApiResponse({ status: 404, description: 'Payment method or linked customer not found' })
    @ApiBody({ type: CreatePosSaleDTO, description: 'Lines, tender type and optional buyer of a counter sale' })
    async createSale(@CurrentUser('_id') soldBy: string, @Body() body: CreatePosSaleDTO) {
        return this.posService.createSale(soldBy, body);
    }

    @Post('preview')
    @HttpCode(200)
    @UseGuards(AuthGuards, RoleGuards)
    @Roles(TypeRoles.ADMIN)
    @ApiOperation({
        summary: 'Quote a counter sale',
        description:
            'Prices the lines through the same engine the online checkout uses, without writing anything. A coupon that cannot be applied comes back as `couponError` instead of failing.',
    })
    @ApiResponse({ status: 200, description: 'Quoted totals, per line and for the sale' })
    @ApiResponse({ status: 400, description: 'Empty items, inactive product or insufficient stock' })
    @ApiResponse({ status: 401, description: 'Unauthorized' })
    @ApiResponse({ status: 403, description: 'Admin role required' })
    @ApiBody({ type: PreviewPosSaleDTO, description: 'Lines and optional coupon to quote' })
    async preview(@Body() body: PreviewPosSaleDTO) {
        return this.posService.preview(body);
    }

    @Patch('sale/:id/refund')
    @HttpCode(200)
    @UseGuards(AuthGuards, RoleGuards)
    @Roles(TypeRoles.ADMIN)
    @ApiOperation({
        summary: 'Refund a counter sale',
        description: 'Moves the sale to REFUNDED and gives the units back. Refunding twice is rejected.',
    })
    @ApiResponse({ status: 200, description: 'Sale refunded and stock restored' })
    @ApiResponse({ status: 400, description: 'Not a POS sale, or already cancelled or refunded' })
    @ApiResponse({ status: 401, description: 'Unauthorized' })
    @ApiResponse({ status: 403, description: 'Admin role required' })
    @ApiResponse({ status: 404, description: 'Sale not found' })
    async refund(@Param('id') id: string) {
        return this.posService.refund(id);
    }

    @Get('sale')
    @HttpCode(200)
    @UseGuards(AuthGuards, RoleGuards)
    @Roles(TypeRoles.ADMIN)
    @ApiOperation({
        summary: 'List counter sales',
        description:
            'Always scoped to the POS channel. For "today", send the day boundaries of the store timezone as dateFrom and dateTo: the server does not assume a timezone.',
    })
    @ApiResponse({ status: 200, description: 'Paginated counter sales, newest first' })
    @ApiResponse({ status: 401, description: 'Unauthorized' })
    @ApiResponse({ status: 403, description: 'Admin role required' })
    async findAll(@Query() options: FilterPosSalesDTO) {
        return this.posService.findAll(options);
    }
}
