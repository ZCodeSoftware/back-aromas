import { Body, Controller, Get, HttpCode, Inject, Param, Post, UseGuards } from "@nestjs/common";
import { ApiBody, ApiResponse, ApiTags } from "@nestjs/swagger";
import SymbolsCatalogs from "../../../symbols-catalogs";
import { ICatColorService } from "../../../domain/services/cat-color.interface.service";
import { AuthGuards } from "../../../../auth/infrastructure/nest/guards/auth.guard";
import { RoleGuards } from "../../../../auth/infrastructure/nest/guards/role.guard";
import { CreateColorDTO } from "../dtos/cat-color.dto";



@ApiTags('cat-color')
@Controller('cat-color')
export class CatColorController {
    constructor(
        @Inject(SymbolsCatalogs.ICatColorService) private readonly catColorService: ICatColorService
    ) { }

    @Post()
    @UseGuards(AuthGuards, RoleGuards)
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
}