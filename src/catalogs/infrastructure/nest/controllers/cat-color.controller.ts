import { Body, Controller, Delete, Get, HttpCode, Inject, Param, Post, Put, UseGuards } from "@nestjs/common";
import { ApiBody, ApiResponse, ApiTags } from "@nestjs/swagger";
import SymbolsCatalogs from "../../../symbols-catalogs";
import { ICatColorService } from "../../../domain/services/cat-color.interface.service";
import { Roles } from "../../../../auth/infrastructure/nest/decorators/roles.decorator";
import { AuthGuards } from "../../../../auth/infrastructure/nest/guards/auth.guard";
import { RoleGuards } from "../../../../auth/infrastructure/nest/guards/role.guard";
import { TypeRoles } from "../../../../core/domain/enums/type-roles.enum";
import { CreateColorDTO, UpdateColorDTO } from "../dtos/cat-color.dto";



@ApiTags('cat-color')
@Controller('cat-color')
export class CatColorController {
    constructor(
        @Inject(SymbolsCatalogs.ICatColorService) private readonly catColorService: ICatColorService
    ) { }

    @Post()
    @UseGuards(AuthGuards, RoleGuards)
    @Roles(TypeRoles.ADMIN)
    @HttpCode(201)
    @ApiResponse({ status: 201, description: 'Color Created' })
    @ApiResponse({ status: 400, description: `Sub-Category shouldn't be created` })
    @ApiBody({ type: CreateColorDTO, description: 'Data to create a Color' })
    async create(@Body() body: CreateColorDTO) {
        return this.catColorService.create(body);
    }


    @Get()
    @HttpCode(200)
    @ApiResponse({ status: 200, description: 'Return all Colors' })
    @ApiResponse({ status: 404, description: 'Colors not found' })
    async findAll() {
        return this.catColorService.findAll();
    }

    @Get(':id')
    @HttpCode(200)
    @ApiResponse({ status: 200, description: 'Return Color by id' })
    @ApiResponse({ status: 404, description: 'Color not found' })
    async findById(@Param('id') id: string) {
        return this.catColorService.findById(id);
    }

    @Put(':id')
    @UseGuards(AuthGuards, RoleGuards)
    @Roles(TypeRoles.ADMIN)
    @HttpCode(200)
    @ApiResponse({ status: 200, description: 'Color updated' })
    @ApiResponse({ status: 404, description: 'Color not found' })
    @ApiBody({ type: UpdateColorDTO, description: 'Data to update a Color' })
    async update(@Param('id') id: string, @Body() body: UpdateColorDTO) {
        return this.catColorService.update(id, body);
    }

    @Delete(':id')
    @UseGuards(AuthGuards, RoleGuards)
    @Roles(TypeRoles.ADMIN)
    @HttpCode(200)
    @ApiResponse({ status: 200, description: 'Color deactivated (soft delete)' })
    @ApiResponse({ status: 404, description: 'Color not found' })
    async delete(@Param('id') id: string) {
        return this.catColorService.delete(id);
    }
}