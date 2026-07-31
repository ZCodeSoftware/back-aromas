import { Body, Controller, Get, HttpCode, Inject, Param, Patch, Post, Query, UseGuards } from "@nestjs/common";
import { ApiBody, ApiResponse, ApiTags } from "@nestjs/swagger";
import { Roles } from "../../../../auth/infrastructure/nest/decorators/roles.decorator";
import { AuthGuards } from "../../../../auth/infrastructure/nest/guards/auth.guard";
import { RoleGuards } from "../../../../auth/infrastructure/nest/guards/role.guard";
import { TypeRoles } from "../../../../core/domain/enums/type-roles.enum";
import { CurrentUser } from "../../../../core/infrastructure/nest/decorators/current-user.decorator";
import { IOrderService } from "../../../domain/services/order.interface.service";
import SymbolsOrder from "../../../symbols-order";
import { FilterAllOrdersDTO, FilterOrderDTO } from "../dtos/filter-order.dto";
import { ChangeOrderStatusDTO, CreateOrderDTO, PreviewOrderDTO } from "../dtos/order.dto";

@ApiTags('order')
@Controller('order')
export class OrderController {
    constructor(
        @Inject(SymbolsOrder.IOrderService)
        private readonly orderService: IOrderService
    ) { }

    @Post()
    @HttpCode(201)
    @UseGuards(AuthGuards)
    @ApiResponse({ status: 401, description: 'Unauthorized' })
    @ApiResponse({ status: 201, description: 'Order created from the cart of the authenticated user' })
    @ApiResponse({ status: 400, description: 'Empty cart, insufficient stock or missing address' })
    @ApiResponse({ status: 403, description: 'The selected address belongs to another user' })
    @ApiResponse({ status: 404, description: 'Payment method or address not found' })
    @ApiBody({ type: CreateOrderDTO, description: 'Payment and shipping data to confirm the cart' })
    async create(@CurrentUser('_id') userId: string, @Body() body: CreateOrderDTO) {
        return this.orderService.create(userId, body);
    }

    /**
     * Declared before `:id` so the literal route wins the match. A POST because it
     * carries a body and, unlike the GETs here, must never be cached: the total it
     * returns depends on promotions that expire.
     */
    @Post('preview')
    @HttpCode(200)
    @UseGuards(AuthGuards)
    @ApiResponse({ status: 401, description: 'Unauthorized' })
    @ApiResponse({
        status: 200,
        description:
            'Prices the cart without creating anything. A coupon that cannot be applied comes back as `couponError` instead of failing',
    })
    @ApiResponse({ status: 400, description: 'Empty cart' })
    @ApiBody({ type: PreviewOrderDTO, description: 'Coupon and shipping to include in the quote' })
    async preview(@CurrentUser('_id') userId: string, @Body() body: PreviewOrderDTO) {
        return this.orderService.preview(userId, body);
    }

    @Get('me')
    @HttpCode(200)
    @UseGuards(AuthGuards)
    @ApiResponse({ status: 401, description: 'Unauthorized' })
    @ApiResponse({ status: 200, description: 'Paginated orders of the authenticated user' })
    async findMine(@CurrentUser('_id') userId: string, @Query() options: FilterOrderDTO) {
        return this.orderService.findByUser(userId, options);
    }

    @Get()
    @HttpCode(200)
    @UseGuards(AuthGuards, RoleGuards)
    @Roles(TypeRoles.ADMIN)
    @ApiResponse({ status: 401, description: 'Unauthorized' })
    @ApiResponse({ status: 403, description: 'Admin role required' })
    @ApiResponse({ status: 200, description: 'Paginated orders of every customer' })
    async findAll(@Query() options: FilterAllOrdersDTO) {
        return this.orderService.findAll(options);
    }

    @Get(':id')
    @HttpCode(200)
    @UseGuards(AuthGuards)
    @ApiResponse({ status: 401, description: 'Unauthorized' })
    @ApiResponse({ status: 403, description: 'The order belongs to another user' })
    @ApiResponse({ status: 404, description: 'Order not found' })
    @ApiResponse({ status: 200, description: 'Return order by id' })
    async findById(@Param('id') id: string, @CurrentUser('_id') userId: string) {
        return this.orderService.findById(id, userId);
    }

    @Patch(':id/status')
    @HttpCode(200)
    @UseGuards(AuthGuards, RoleGuards)
    @Roles(TypeRoles.ADMIN)
    @ApiResponse({ status: 401, description: 'Unauthorized' })
    @ApiResponse({ status: 403, description: 'Admin role required' })
    @ApiResponse({ status: 400, description: 'Invalid status transition' })
    @ApiResponse({ status: 404, description: 'Order not found' })
    @ApiResponse({ status: 200, description: 'Order status updated' })
    @ApiBody({ type: ChangeOrderStatusDTO, description: 'New status for the order' })
    async changeStatus(@Param('id') id: string, @Body() body: ChangeOrderStatusDTO) {
        return this.orderService.changeStatus(id, body.status);
    }

    @Patch(':id/cancel')
    @HttpCode(200)
    @UseGuards(AuthGuards)
    @ApiResponse({ status: 401, description: 'Unauthorized' })
    @ApiResponse({ status: 403, description: 'The order belongs to another user' })
    @ApiResponse({ status: 400, description: 'Only pending orders can be cancelled' })
    @ApiResponse({ status: 404, description: 'Order not found' })
    @ApiResponse({ status: 200, description: 'Order cancelled and stock restored' })
    async cancel(@Param('id') id: string, @CurrentUser('_id') userId: string) {
        return this.orderService.cancel(id, userId);
    }
}
