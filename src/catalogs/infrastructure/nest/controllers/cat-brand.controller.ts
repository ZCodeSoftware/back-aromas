import { Body, Controller, Delete, Get, HttpCode, Inject, Param, Post, Put, UseGuards } from "@nestjs/common";
import { ApiBody, ApiResponse, ApiTags } from "@nestjs/swagger";
import SymbolsCatalogs from "../../../symbols-catalogs";
import { ICatBrandService } from "../../../domain/services/cat-brand.service";
import { Roles } from "../../../../auth/infrastructure/nest/decorators/roles.decorator";
import { AuthGuards } from "../../../../auth/infrastructure/nest/guards/auth.guard";
import { RoleGuards } from "../../../../auth/infrastructure/nest/guards/role.guard";
import { TypeRoles } from "../../../../core/domain/enums/type-roles.enum";
import { CreateBrandDTO, UpdateBrandDTO } from "../dtos/cat-brand.dto";



@ApiTags('cat-brand')
@Controller('cat-brand')
export class CatBrandController {
    constructor(
        @Inject(
            SymbolsCatalogs.ICatBrandService
        ) private readonly catBrandService: ICatBrandService
    ) { }

    @Post()
    @UseGuards(AuthGuards, RoleGuards)
    @Roles(TypeRoles.ADMIN)
    @HttpCode(201)
    @ApiResponse(
        {
            status: 201,
            description: 'Brand Created'
        }
    )
    @ApiResponse(
        {
            status: 400,
            description: `Brand shouldn't be created`
        }
    )
    async create(@Body() body: CreateBrandDTO) {
        return this.catBrandService.create(body)
    }

    @Get()
    @HttpCode(200)
    @ApiResponse(
        {
            status: 200,
            description: 'Return All Brand'
        }
    )
    @ApiResponse(
        {
            status: 400,
            description: `Brand not found`
        }
    )
    async findAll() {
        return this.catBrandService.findAll();
    }

    // Declared before `:id` so the literal route wins the match. Admin-only: the
    // storefront keeps seeing active rows only, the dashboard needs the deactivated
    // ones listed to be able to restore them.
    @Get('all')
    @UseGuards(AuthGuards, RoleGuards)
    @Roles(TypeRoles.ADMIN)
    @HttpCode(200)
    @ApiResponse({ status: 200, description: 'Return all Brands, deactivated ones included' })
    @ApiResponse({ status: 401, description: 'Unauthorized' })
    @ApiResponse({ status: 403, description: 'Admin role required' })
    async findAllIncludingInactive() {
        return this.catBrandService.findAll(true);
    }

    @Get(':id')
    @HttpCode(200)
    @ApiResponse(
        {
            status: 200,
            description: 'Return Brand by id'
        }
    )
    @ApiResponse(
        {
            status: 404,
            description: 'Brand not Found'
        }
    )
    async findById(@Param('id') id: string) {
        return this.catBrandService.findById(id);
    }

    @Put(':id')
    @UseGuards(AuthGuards, RoleGuards)
    @Roles(TypeRoles.ADMIN)
    @HttpCode(200)
    @ApiResponse(
        {
            status: 200,
            description: 'Brand updated'
        }
    )
    @ApiResponse(
        {
            status: 404,
            description: 'Brand not Found'
        }
    )
    @ApiBody({ type: UpdateBrandDTO, description: 'Data to update a Brand' })
    async update(@Param('id') id: string, @Body() body: UpdateBrandDTO) {
        return this.catBrandService.update(id, body);
    }

    @Delete(':id')
    @UseGuards(AuthGuards, RoleGuards)
    @Roles(TypeRoles.ADMIN)
    @HttpCode(200)
    @ApiResponse(
        {
            status: 200,
            description: 'Brand deactivated (soft delete)'
        }
    )
    @ApiResponse(
        {
            status: 404,
            description: 'Brand not Found'
        }
    )
    async delete(@Param('id') id: string) {
        return this.catBrandService.delete(id);
    }


}