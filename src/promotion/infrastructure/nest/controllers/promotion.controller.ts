import { Body, Controller, Delete, Get, HttpCode, Inject, Param, Post, Put, Query, UseGuards } from "@nestjs/common";
import { ApiBody, ApiResponse, ApiTags } from "@nestjs/swagger";
import { Roles } from "../../../../auth/infrastructure/nest/decorators/roles.decorator";
import { AuthGuards } from "../../../../auth/infrastructure/nest/guards/auth.guard";
import { RoleGuards } from "../../../../auth/infrastructure/nest/guards/role.guard";
import { TypeRoles } from "../../../../core/domain/enums/type-roles.enum";
import { IPromotionService } from "../../../domain/services/promotion.interface.service";
import SymbolsPromotion from "../../../symbols-promotion";
import { FilterPromotionOptionsDTO } from "../dtos/filter-promotion.dto";
import { CreatePromotionDTO, UpdatePromotionDTO } from "../dtos/promotion.dto";

@ApiTags('promotion')
@Controller('promotion')
export class PromotionController {
    constructor(
        @Inject(SymbolsPromotion.IPromotionService)
        private readonly promotionService: IPromotionService
    ) { }

    @Post()
    @HttpCode(201)
    @UseGuards(AuthGuards, RoleGuards)
    @Roles(TypeRoles.ADMIN)
    @ApiResponse({ status: 401, description: 'Unauthorized' })
    @ApiResponse({ status: 201, description: 'Promotion created' })
    @ApiResponse({ status: 400, description: 'Invalid scope, value or duplicated coupon code' })
    @ApiBody({ type: CreatePromotionDTO, description: 'Data to create a Promotion' })
    async create(@Body() body: CreatePromotionDTO) {
        return this.promotionService.create(body);
    }

    /**
     * Public and deliberately narrow: only the promotions that apply on their own,
     * so the storefront can show a struck-through price. Coupons are never listed
     * here — that would hand every code away.
     */
    @Get('active')
    @HttpCode(200)
    @ApiResponse({ status: 200, description: 'Automatic promotions in force right now' })
    async findActiveAutomatic() {
        return this.promotionService.findActiveAutomatic();
    }

    @Get()
    @HttpCode(200)
    @UseGuards(AuthGuards, RoleGuards)
    @Roles(TypeRoles.ADMIN)
    @ApiResponse({ status: 200, description: 'Return all Promotions' })
    @ApiResponse({ status: 401, description: 'Unauthorized' })
    async findAll(@Query() options: FilterPromotionOptionsDTO) {
        return this.promotionService.findAll(options);
    }

    // Declared before `:id` so the literal route wins the match.
    @Get('all')
    @HttpCode(200)
    @UseGuards(AuthGuards, RoleGuards)
    @Roles(TypeRoles.ADMIN)
    @ApiResponse({ status: 200, description: 'Return all Promotions, deactivated ones included' })
    @ApiResponse({ status: 401, description: 'Unauthorized' })
    async findAllIncludingInactive(@Query() options: FilterPromotionOptionsDTO) {
        return this.promotionService.findAll({ ...options, includeInactive: true });
    }

    @Get(':id')
    @HttpCode(200)
    @UseGuards(AuthGuards, RoleGuards)
    @Roles(TypeRoles.ADMIN)
    @ApiResponse({ status: 200, description: 'Return Promotion by id' })
    @ApiResponse({ status: 404, description: 'Promotion not found' })
    async findById(@Param('id') id: string) {
        return this.promotionService.findById(id);
    }

    @Put(':id')
    @HttpCode(200)
    @UseGuards(AuthGuards, RoleGuards)
    @Roles(TypeRoles.ADMIN)
    @ApiResponse({ status: 401, description: 'Unauthorized' })
    @ApiResponse({ status: 200, description: 'Promotion updated' })
    @ApiResponse({ status: 404, description: 'Promotion not found' })
    @ApiBody({ type: UpdatePromotionDTO, description: 'Data to update a Promotion' })
    async update(@Param('id') id: string, @Body() body: UpdatePromotionDTO) {
        return this.promotionService.update(id, body);
    }

    @Delete(':id')
    @HttpCode(200)
    @UseGuards(AuthGuards, RoleGuards)
    @Roles(TypeRoles.ADMIN)
    @ApiResponse({ status: 401, description: 'Unauthorized' })
    @ApiResponse({ status: 200, description: 'Promotion deactivated (soft delete)' })
    @ApiResponse({ status: 404, description: 'Promotion not found' })
    async delete(@Param('id') id: string) {
        return this.promotionService.delete(id);
    }
}
