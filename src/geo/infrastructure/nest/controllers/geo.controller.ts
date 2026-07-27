import { Body, Controller, Get, HttpCode, Inject, Param, Post } from "@nestjs/common";
import { ApiBody, ApiResponse, ApiTags } from "@nestjs/swagger";
import { IGeoService } from "../../../domain/services/geo.interface.service";
import SymbolsGeo from "../../../symbols-geo";
import { CreateGeoDTO } from "../dtos/geo.dto";

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
}
