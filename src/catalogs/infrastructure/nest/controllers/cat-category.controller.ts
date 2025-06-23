import { Body, Controller, Get, HttpCode, Inject, Param, Post, Put, UseGuards } from "@nestjs/common";
import { ApiResponse, ApiTags } from "@nestjs/swagger";
import { AuthGuards } from "../../../../auth/infrastructure/nest/guards/auth.guard";
import { RoleGuards } from "../../../../auth/infrastructure/nest/guards/role.guard";
import { ICatCategoryService } from "../../../domain/services/cat-category.service";
import SymbolsCatalogs from "../../../symbols-catalogs";
import { CreateCategoryDTO } from "../dtos/cat-category.dto";


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
    async update(@Param('id') id: string, @Body() body: Partial<CreateCategoryDTO>) {
        return this.catCategoryService.update(id, body);
    }
}