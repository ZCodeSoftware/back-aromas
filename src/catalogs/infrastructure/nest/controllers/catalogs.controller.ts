import { Body, Controller, Delete, Get, HttpCode, Inject, Param, Post, Put, UseGuards } from "@nestjs/common";
import { ApiBody, ApiResponse, ApiTags } from "@nestjs/swagger";
import { Roles } from "../../../../auth/infrastructure/nest/decorators/roles.decorator";
import { AuthGuards } from "../../../../auth/infrastructure/nest/guards/auth.guard";
import { RoleGuards } from "../../../../auth/infrastructure/nest/guards/role.guard";
import { TypeRoles } from "../../../../core/domain/enums/type-roles.enum";
import { ICatRoleService } from "../../../domain/services/cat-role.interface.service";
import SymbolsCatalogs from "../../../symbols-catalogs";
import { CreateRoleDTO, UpdateRoleDTO } from "../dtos/cat-role.dto";

@ApiTags('cat-role')
@Controller('cat-role')
export class CatRoleController {
    constructor(
        @Inject(SymbolsCatalogs.ICatRoleService)
        private readonly catRoleService: ICatRoleService
    ) { }

    @Post()
    @UseGuards(AuthGuards, RoleGuards)
    @Roles(TypeRoles.ADMIN)
    @HttpCode(201)
    @ApiResponse({ status: 201, description: 'Role created' })
    @ApiResponse({ status: 400, description: `Role shouldn't be created` })
    @ApiResponse({ status: 401, description: 'Unauthorized' })
    @ApiResponse({ status: 403, description: 'Admin role required' })
    @ApiBody({ type: CreateRoleDTO, description: 'Data to create a Role' })
    async create(@Body() body: CreateRoleDTO) {
        return this.catRoleService.create(body);
    }

    // The role catalog is authorization metadata, not storefront data: unlike the
    // other catalogs its reads stay admin-only.
    @Get()
    @UseGuards(AuthGuards, RoleGuards)
    @Roles(TypeRoles.ADMIN)
    @HttpCode(200)
    @ApiResponse({ status: 200, description: 'Return all Roles' })
    @ApiResponse({ status: 401, description: 'Unauthorized' })
    @ApiResponse({ status: 403, description: 'Admin role required' })
    @ApiResponse({ status: 404, description: 'Role not found' })
    async findAll() {
        return this.catRoleService.findAll();
    }

    // Declared before `:id` so the literal route wins the match. Lists the
    // deactivated roles too, so the dashboard can restore them.
    @Get('all')
    @UseGuards(AuthGuards, RoleGuards)
    @Roles(TypeRoles.ADMIN)
    @HttpCode(200)
    @ApiResponse({ status: 200, description: 'Return all Roles, deactivated ones included' })
    @ApiResponse({ status: 401, description: 'Unauthorized' })
    @ApiResponse({ status: 403, description: 'Admin role required' })
    async findAllIncludingInactive() {
        return this.catRoleService.findAll(true);
    }

    @Get(':id')
    @UseGuards(AuthGuards, RoleGuards)
    @Roles(TypeRoles.ADMIN)
    @HttpCode(200)
    @ApiResponse({ status: 200, description: 'Return role by id' })
    @ApiResponse({ status: 401, description: 'Unauthorized' })
    @ApiResponse({ status: 403, description: 'Admin role required' })
    @ApiResponse({ status: 404, description: 'Role not found' })
    async findById(@Param('id') id: string) {
        return this.catRoleService.findById(id);
    }

    @Put(':id')
    @UseGuards(AuthGuards, RoleGuards)
    @Roles(TypeRoles.ADMIN)
    @HttpCode(200)
    @ApiResponse({ status: 200, description: 'Role updated' })
    @ApiResponse({ status: 404, description: 'Role not found' })
    @ApiBody({ type: UpdateRoleDTO, description: 'Data to update a Role' })
    async update(@Param('id') id: string, @Body() body: UpdateRoleDTO) {
        return this.catRoleService.update(id, body);
    }

    @Delete(':id')
    @UseGuards(AuthGuards, RoleGuards)
    @Roles(TypeRoles.ADMIN)
    @HttpCode(200)
    @ApiResponse({ status: 200, description: 'Role deactivated (soft delete)' })
    @ApiResponse({ status: 404, description: 'Role not found' })
    async delete(@Param('id') id: string) {
        return this.catRoleService.delete(id);
    }
}
