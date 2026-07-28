import { Body, Controller, Delete, Get, HttpCode, Inject, Param, Post, Put, UseGuards } from "@nestjs/common";
import { ApiBody, ApiResponse, ApiTags } from "@nestjs/swagger";
import { AuthGuards } from "../../../../auth/infrastructure/nest/guards/auth.guard";
import { RoleGuards } from "../../../../auth/infrastructure/nest/guards/role.guard";
import { IGeoService } from "../../../domain/services/geo.interface.service";
import SymbolsGeo from "../../../symbols-geo";
import { CreateGeoDTO, UpdateGeoDTO } from "../dtos/geo.dto";

@ApiTags('geo')
@Controller('geo')
export class GeoController {
    constructor(
        @Inject(SymbolsGeo.IGeoService)
        private readonly geoService: IGeoService
    ) { }

    @Post()
    @HttpCode(201)
    @ApiResponse({ status: 201, description: 'Geo created' })
    @ApiResponse({ status: 400, description: `Geo shouldn't be created` })
    @ApiBody({ type: CreateGeoDTO, description: 'Data to create a Geo' })
    async create(@Body() body: CreateGeoDTO) {
        return this.geoService.create(body);
    }

    @Get()
    @HttpCode(200)
    @ApiResponse({ status: 200, description: 'Return all Geos' })
    @ApiResponse({ status: 404, description: 'Geo not found' })
    async findAll() {
        return this.geoService.findAll();
    }

    @Get(':id')
    @HttpCode(200)
    @ApiResponse({ status: 200, description: 'Return Geo by id' })
    @ApiResponse({ status: 404, description: 'Geo not found' })
    async findById(@Param('id') id: string) {
        return this.geoService.findById(id);
    }

    @Put(':id')
    @UseGuards(AuthGuards, RoleGuards)
    @HttpCode(200)
    @ApiResponse({ status: 200, description: 'Geo updated' })
    @ApiResponse({ status: 404, description: 'Geo not found' })
    @ApiBody({ type: UpdateGeoDTO, description: 'Data to update a Geo' })
    async update(@Param('id') id: string, @Body() body: UpdateGeoDTO) {
        return this.geoService.update(id, body);
    }

    @Delete(':id')
    @UseGuards(AuthGuards, RoleGuards)
    @HttpCode(200)
    @ApiResponse({ status: 200, description: 'Geo deactivated (soft delete)' })
    @ApiResponse({ status: 404, description: 'Geo not found' })
    async delete(@Param('id') id: string) {
        return this.geoService.delete(id);
    }
}
