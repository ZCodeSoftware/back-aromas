import { Body, Controller, Get, HttpCode, Inject, Param, Post, UseGuards } from "@nestjs/common";
import { ApiResponse, ApiTags } from "@nestjs/swagger";
import SymbolsCatalogs from "../../../symbols-catalogs";
import { ICatBrandService } from "../../../domain/services/cat-brand.service";
import { AuthGuards } from "../../../../auth/infrastructure/nest/guards/auth.guard";
import { RoleGuards } from "../../../../auth/infrastructure/nest/guards/role.guard";
import { CreateBrandDTO } from "../dtos/cat-brand.dto";



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


}