import { ApiBody, ApiResponse, ApiTags } from "@nestjs/swagger";
import { ICatSubCategoryService } from "../../../domain/services/cat-sub-category.service";
import { Body, Controller, Get, HttpCode, Inject, Param, Post, UseGuards } from "@nestjs/common";
import SymbolsCatalogs from "../../../symbols-catalogs";
import { CreateSubCategoryDTO } from "../dtos/cat-sub-category.dto";
import { AuthGuards } from "../../../../auth/infrastructure/nest/guards/auth.guard";
import { RoleGuards } from "../../../../auth/infrastructure/nest/guards/role.guard";


@ApiTags('cat-sub-category')
@Controller('cat-sub-category')
export class CatSubCategoryController {
    constructor(
        @Inject(SymbolsCatalogs.ICatSubCategoryService)
        private readonly catSubCategoryService: ICatSubCategoryService
    ) { }


    @Post()
    @UseGuards(AuthGuards, RoleGuards)
    @HttpCode(201)
    @ApiResponse({ status: 201, description: 'Sub-Category Created' })
    @ApiResponse({ status: 400, description: `Sub-Category shouldn't be created` })
    @ApiBody({ type: CreateSubCategoryDTO, description: 'Data to create a Sub-Category' })
    async create(@Body() body: CreateSubCategoryDTO) {
        return this.catSubCategoryService.create(body);
    }

    @Get()
    @HttpCode(200)
    @ApiResponse({ status: 200, description: 'Return all Categories' })
    @ApiResponse({ status: 404, description: 'Categories not found' })
    async findAll() {
        return this.catSubCategoryService.findAll();
    }

    @Get(':id')
    @HttpCode(200)
    @ApiResponse({ status: 200, description: 'Return category by id' })
    @ApiResponse({ status: 404, description: 'Category not found' })
    async findById(@Param('id') id: string) {
        return this.catSubCategoryService.findById(id);
    }
}