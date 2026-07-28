import { Body, Controller, Delete, Get, HttpCode, Inject, Param, Post, Put, UseGuards } from "@nestjs/common";
import { ApiBody, ApiResponse, ApiTags } from "@nestjs/swagger";
import SymbolsCatalogs from "../../../symbols-catalogs";
import { ICatTypeHousingService } from "../../../domain/services/cat-type-housing.service";
import { AuthGuards } from "../../../../auth/infrastructure/nest/guards/auth.guard";
import { RoleGuards } from "../../../../auth/infrastructure/nest/guards/role.guard";
import { CreateTypeHousingDTO, UpdateTypeHousingDTO } from "../dtos/cat-type-housing.dto";



@ApiTags('cat-type-housing')
@Controller('cat-type-housing')
export class CatTypeHousingController {
    constructor(
        @Inject(SymbolsCatalogs.ICatTypeHousingService) private readonly catTypeHousingService: ICatTypeHousingService
    ) { }

    @Post()
    @UseGuards(AuthGuards, RoleGuards)
    @HttpCode(201)
    @ApiResponse(
        {
            status: 201,
            description: 'Type of Housing Created'
        }
    )
    @ApiResponse(
        {
            status: 400,
            description: `Type of Housing shouldn't be created`
        }
    )
    async create(@Body() body: CreateTypeHousingDTO) {
        return this.catTypeHousingService.create(body)
    }

    @Get()
    @HttpCode(200)
    @ApiResponse(
        {
            status: 200,
            description: 'Return All Type Housing'
        }
    )
    @ApiResponse(
        {
            status: 404,
            description: 'Type Housing not found'
        }
    )
    async findAll() {
        return this.catTypeHousingService.findAll();
    }

    @Get(':id')
    @HttpCode(200)
    @ApiResponse(
        {
            status: 200,
            description: 'Return Type Housing by id'
        }
    )
    @ApiResponse(
        {
            status: 404,
            description: 'Type Housing by id Not Found'
        }
    )
    async findById(@Param('id') id: string) {
        return this.catTypeHousingService.findById(id);
    }

    @Put(':id')
    @UseGuards(AuthGuards, RoleGuards)
    @HttpCode(200)
    @ApiResponse(
        {
            status: 200,
            description: 'Type Housing updated'
        }
    )
    @ApiResponse(
        {
            status: 404,
            description: 'Type Housing by id Not Found'
        }
    )
    @ApiBody({ type: UpdateTypeHousingDTO, description: 'Data to update a Type Housing' })
    async update(@Param('id') id: string, @Body() body: UpdateTypeHousingDTO) {
        return this.catTypeHousingService.update(id, body);
    }

    @Delete(':id')
    @UseGuards(AuthGuards, RoleGuards)
    @HttpCode(200)
    @ApiResponse(
        {
            status: 200,
            description: 'Type Housing deactivated (soft delete)'
        }
    )
    @ApiResponse(
        {
            status: 404,
            description: 'Type Housing by id Not Found'
        }
    )
    async delete(@Param('id') id: string) {
        return this.catTypeHousingService.delete(id);
    }

}