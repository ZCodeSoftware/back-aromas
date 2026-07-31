import { Body, Controller, Delete, Get, HttpCode, Inject, Param, Post, Put, Query, UseGuards } from "@nestjs/common";
import { ApiBody, ApiResponse, ApiTags } from "@nestjs/swagger";
import { Roles } from "../../../../auth/infrastructure/nest/decorators/roles.decorator";
import { AuthGuards } from "../../../../auth/infrastructure/nest/guards/auth.guard";
import { RoleGuards } from "../../../../auth/infrastructure/nest/guards/role.guard";
import { TypeRoles } from "../../../../core/domain/enums/type-roles.enum";
import { IComboService } from "../../../domain/services/combo.interface.service";
import SymbolsCombo from "../../../symbols-combo";
import { CreateComboDTO, UpdateComboDTO } from "../dtos/combo.dto";
import { FilterComboOptionsDTO } from "../dtos/filter-combo.dto";

@ApiTags('combo')
@Controller('combo')
export class ComboController {
    constructor(
        @Inject(SymbolsCombo.IComboService)
        private readonly comboService: IComboService
    ) { }

    @Post()
    @HttpCode(201)
    @UseGuards(AuthGuards, RoleGuards)
    @Roles(TypeRoles.ADMIN)
    @ApiResponse({ status: 401, description: 'Unauthorized' })
    @ApiResponse({ status: 201, description: 'Combo created' })
    @ApiResponse({ status: 400, description: `Combo shouldn't be created` })
    @ApiBody({ type: CreateComboDTO, description: 'Data to create a Combo' })
    async create(@Body() body: CreateComboDTO) {
        return this.comboService.create(body);
    }

    @Get()
    @HttpCode(200)
    @ApiResponse({ status: 200, description: 'Return all Combos, price and stock derived from their products' })
    async findAll(@Query() options: FilterComboOptionsDTO) {
        return this.comboService.findAll(options);
    }

    // Declared before `:id` so the literal route wins the match. Same filters as the
    // public listing, except the soft-deleted combos come back too so the dashboard
    // can reactivate them.
    @Get('all')
    @HttpCode(200)
    @UseGuards(AuthGuards, RoleGuards)
    @Roles(TypeRoles.ADMIN)
    @ApiResponse({ status: 200, description: 'Return all Combos, deactivated ones included' })
    @ApiResponse({ status: 401, description: 'Unauthorized' })
    @ApiResponse({ status: 403, description: 'Admin role required' })
    async findAllIncludingInactive(@Query() options: FilterComboOptionsDTO) {
        return this.comboService.findAll({ ...options, includeInactive: true });
    }

    @Get(':id')
    @HttpCode(200)
    @ApiResponse({ status: 200, description: 'Return Combo by id' })
    @ApiResponse({ status: 404, description: 'Combo not found' })
    async findById(@Param('id') id: string) {
        return this.comboService.findById(id);
    }

    @Put(':id')
    @HttpCode(200)
    @UseGuards(AuthGuards, RoleGuards)
    @Roles(TypeRoles.ADMIN)
    @ApiResponse({ status: 401, description: 'Unauthorized' })
    @ApiResponse({ status: 200, description: 'Combo updated' })
    @ApiResponse({ status: 404, description: 'Combo not found' })
    @ApiBody({ type: UpdateComboDTO, description: 'Data to update a Combo' })
    async update(@Param('id') id: string, @Body() body: UpdateComboDTO) {
        return this.comboService.update(id, body);
    }

    @Delete(':id')
    @HttpCode(200)
    @UseGuards(AuthGuards, RoleGuards)
    @Roles(TypeRoles.ADMIN)
    @ApiResponse({ status: 401, description: 'Unauthorized' })
    @ApiResponse({ status: 200, description: 'Combo deactivated (soft delete)' })
    @ApiResponse({ status: 404, description: 'Combo not found' })
    async delete(@Param('id') id: string) {
        return this.comboService.delete(id);
    }
}
