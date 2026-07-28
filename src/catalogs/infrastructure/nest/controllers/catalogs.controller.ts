import { Body, Controller, Delete, Get, HttpCode, Inject, Param, Post, Put, UseGuards } from "@nestjs/common";
import { ApiBody, ApiResponse, ApiTags } from "@nestjs/swagger";
import { AuthGuards } from "../../../../auth/infrastructure/nest/guards/auth.guard";
import { RoleGuards } from "../../../../auth/infrastructure/nest/guards/role.guard";
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
    @HttpCode(201)
    @ApiResponse({ status: 201, description: 'Role created' })
    @ApiResponse({ status: 400, description: `Role shouldn't be created` })
    @ApiBody({ type: CreateRoleDTO, description: 'Data to create a Role' })
    async create(@Body() body: CreateRoleDTO) {
        return this.catRoleService.create(body);
    }

    @Get()
    @HttpCode(200)
    @ApiResponse({ status: 200, description: 'Return all Roles' })
    @ApiResponse({ status: 404, description: 'Role not found' })
    async findAll() {
        return this.catRoleService.findAll();
    }

    @Get(':id')
    @HttpCode(200)
    @ApiResponse({ status: 200, description: 'Return role by id' })
    @ApiResponse({ status: 404, description: 'Role not found' })
    async findById(@Param('id') id: string) {
        return this.catRoleService.findById(id);
    }

    @Put(':id')
    @UseGuards(AuthGuards, RoleGuards)
    @HttpCode(200)
    @ApiResponse({ status: 200, description: 'Role updated' })
    @ApiResponse({ status: 404, description: 'Role not found' })
    @ApiBody({ type: UpdateRoleDTO, description: 'Data to update a Role' })
    async update(@Param('id') id: string, @Body() body: UpdateRoleDTO) {
        return this.catRoleService.update(id, body);
    }

    @Delete(':id')
    @UseGuards(AuthGuards, RoleGuards)
    @HttpCode(200)
    @ApiResponse({ status: 200, description: 'Role deactivated (soft delete)' })
    @ApiResponse({ status: 404, description: 'Role not found' })
    async delete(@Param('id') id: string) {
        return this.catRoleService.delete(id);
    }
}
