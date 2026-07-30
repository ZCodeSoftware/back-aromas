import { Body, Controller, Get, HttpCode, Inject, Param, Post, Put, UseGuards } from "@nestjs/common";
import { ApiBody, ApiResponse, ApiTags } from "@nestjs/swagger";
import { Roles } from "../../../../auth/infrastructure/nest/decorators/roles.decorator";
import { AuthGuards } from "../../../../auth/infrastructure/nest/guards/auth.guard";
import { RoleGuards } from "../../../../auth/infrastructure/nest/guards/role.guard";
import { TypeRoles } from "../../../../core/domain/enums/type-roles.enum";
import { ICatOrderStatusService } from "../../../domain/services/cat-order-status.service";
import SymbolsCatalogs from "../../../symbols-catalogs";
import { CreateOrderStatusDTO, UpdateOrderStatusDTO } from "../dtos/cat-order-status.dto";


@ApiTags('cat-order-status')
@Controller('cat-order-status')
export class CatOrderStatusController {
    constructor(
        @Inject(SymbolsCatalogs.ICatOrderStatusService) private readonly catOrderStatusService: ICatOrderStatusService
    ) { }

    @Post()
    @UseGuards(AuthGuards, RoleGuards)
    @Roles(TypeRoles.ADMIN)
    @HttpCode(201)
    @ApiResponse({ status: 201, description: 'Order Status Created' })
    @ApiResponse({ status: 400, description: 'The code is unknown or already exists' })
    @ApiBody({ type: CreateOrderStatusDTO, description: 'Data to create an Order Status' })
    async create(@Body() body: CreateOrderStatusDTO) {
        return this.catOrderStatusService.create(body);
    }

    @Get()
    @HttpCode(200)
    @ApiResponse({ status: 200, description: 'Return All Order Statuses, sorted by lifecycle position' })
    async findAll() {
        return this.catOrderStatusService.findAll();
    }

    @Get(':id')
    @HttpCode(200)
    @ApiResponse({ status: 200, description: 'Return Order Status by id' })
    @ApiResponse({ status: 404, description: 'Order Status not Found' })
    async findById(@Param('id') id: string) {
        return this.catOrderStatusService.findById(id);
    }

    @Put(':id')
    @UseGuards(AuthGuards, RoleGuards)
    @Roles(TypeRoles.ADMIN)
    @HttpCode(200)
    @ApiResponse({ status: 200, description: 'Order Status updated' })
    @ApiResponse({ status: 404, description: 'Order Status not Found' })
    @ApiBody({ type: UpdateOrderStatusDTO, description: 'Label and lifecycle position of an Order Status' })
    async update(@Param('id') id: string, @Body() body: UpdateOrderStatusDTO) {
        return this.catOrderStatusService.update(id, body);
    }
}
