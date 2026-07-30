import { Body, Controller, Delete, Get, HttpCode, Inject, Param, Post, Put, UseGuards } from "@nestjs/common";
import { ApiBody, ApiResponse, ApiTags } from "@nestjs/swagger";
import { Roles } from "../../../../auth/infrastructure/nest/decorators/roles.decorator";
import { AuthGuards } from "../../../../auth/infrastructure/nest/guards/auth.guard";
import { RoleGuards } from "../../../../auth/infrastructure/nest/guards/role.guard";
import { TypeRoles } from "../../../../core/domain/enums/type-roles.enum";
import { ICatCategoryService } from "../../../domain/services/cat-category.service";
import SymbolsCatalogs from "../../../symbols-catalogs";
import { CreateCategoryDTO, UpdateCategoryDTO } from "../dtos/cat-category.dto";


@ApiTags('cat-category')
@Controller('cat-category')
export class CatCategoryContorller {
    constructor(
        @Inject(
            SymbolsCatalogs.ICatCategoryService
        ) private readonly catCategoryService: ICatCategoryService
    ) { }

    @Post()
    @UseGuards(AuthGuards, RoleGuards)
    @Roles(TypeRoles.ADMIN)
    @HttpCode(201)
    @ApiResponse(
        {
            status: 201,
            description: 'Category created'
        }
    )
    @ApiResponse(
        {
            status: 400,
            description: `Category shouldn't be created`
        }
    )
    async create(@Body() body: CreateCategoryDTO) {
        return this.catCategoryService.create(body)
    }

    @Get()
    @HttpCode(200)
    @ApiResponse(
        {
            status: 200,
            description: 'Return All Category'
        }
    )
    @ApiResponse(
        {
            status: 400,
            description: `Category not found`
        }
    )
    async findAll() {
        return this.catCategoryService.findAll();
    }

    // Declared before `:id` so the literal route wins the match. Admin-only: the
    // storefront keeps seeing active rows only, the dashboard needs the deactivated
    // ones listed to be able to restore them.
    @Get('all')
    @UseGuards(AuthGuards, RoleGuards)
    @Roles(TypeRoles.ADMIN)
    @HttpCode(200)
    @ApiResponse({ status: 200, description: 'Return all Categories, deactivated ones included' })
    @ApiResponse({ status: 401, description: 'Unauthorized' })
    @ApiResponse({ status: 403, description: 'Admin role required' })
    async findAllIncludingInactive() {
        return this.catCategoryService.findAll(true);
    }

    @Get(':id')
    @HttpCode(200)
    @ApiResponse(
        {
            status: 200,
            description: 'Return Category by id'
        }
    )
    @ApiResponse(
        {
            status: 404,
            description: 'Category not Found'
        }
    )
    async findById(@Param('id') id: string) {
        return this.catCategoryService.findById(id);
    }


    @Put(':id')
    @HttpCode(200)
    @UseGuards(AuthGuards, RoleGuards)
    @Roles(TypeRoles.ADMIN)
    @ApiResponse(
        {
            status: 200,
            description: 'update Category by id'
        }
    )
    @ApiResponse(
        {
            status: 404,
            description: `Category shouldn't be updated`
        }
    )
    @ApiBody({ type: UpdateCategoryDTO, description: 'Data to update a Category' })
    async update(@Param('id') id: string, @Body() body: UpdateCategoryDTO) {
        return this.catCategoryService.update(id, body);
    }

    @Delete(':id')
    @HttpCode(200)
    @UseGuards(AuthGuards, RoleGuards)
    @Roles(TypeRoles.ADMIN)
    @ApiResponse(
        {
            status: 200,
            description: 'Category deactivated (soft delete)'
        }
    )
    @ApiResponse(
        {
            status: 404,
            description: 'Category not Found'
        }
    )
    async delete(@Param('id') id: string) {
        return this.catCategoryService.delete(id);
    }
}