import { Body, Controller, Get, HttpCode, Inject, Param, Post, UseGuards } from "@nestjs/common";
import { ApiResponse, ApiTags } from "@nestjs/swagger";
import SymbolsCatalogs from "../../../symbols-catalogs";
import { ICatEssenceService } from "../../../domain/services/cat-essence.service";
import { AuthGuards } from "../../../../auth/infrastructure/nest/guards/auth.guard";
import { RoleGuards } from "../../../../auth/infrastructure/nest/guards/role.guard";
import { CreateEssenceDTO } from "../dtos/cat-essence.dto";


@ApiTags('cat-essence')
@Controller('cat-essence')
export class CatEssenceController {
    constructor(
        @Inject(SymbolsCatalogs.ICatEssenceService) private readonly catEssenceService: ICatEssenceService
    ) { }

    @Post()
    @UseGuards(AuthGuards, RoleGuards)
    @HttpCode(201)
    @ApiResponse(
        {
            status: 201,
            description: 'Essence Created'
        }
    )
    @ApiResponse(
        {
            status: 400,
            description: `Essence shouldn't be created`
        }
    )
    async create(@Body() body: CreateEssenceDTO) {
        return this.catEssenceService.create(body)
    }

    @Get()
    @HttpCode(200)
    @ApiResponse(
        {
            status: 200,
            description: 'Return All Essence'
        }
    )
    @ApiResponse(
        {
            status: 404,
            description: 'Essence not Found'
        }
    )
    async findAll() {
        return this.catEssenceService.findAll();
    }

    @Get(':id')
    @HttpCode(200)
    @ApiResponse(
        {
            status: 200,
            description: 'Return Essence by id'
        }
    )
    @ApiResponse(
        {
            status: 404,
            description: 'Essence not Found'
        }
    )
    async findById(@Param('id') id: string) {
        return this.catEssenceService.findById(id);
    }


}