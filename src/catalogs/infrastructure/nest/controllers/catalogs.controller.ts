import { Body, Controller, Get, HttpCode, Inject, Param, Post } from "@nestjs/common";
import { ApiBody, ApiResponse, ApiTags } from "@nestjs/swagger";
import { ICatRoleService } from "../../../domain/services/cat-role.interface.service";
import SymbolsCatalogs from "../../../symbols-catalogs";
import { CreateRoleDTO } from "../dtos/cat-role.dto";

@ApiTags('cat-role')
@Controller('cat-role')
export class CatRoleController {
    constructor(
        @Inject(SymbolsCatalogs.ICatRoleService)
        private readonly catRoleService: ICatRoleService
    ) { }

    @Post()
    @HttpCode(201)
    @ApiResponse({ status: 201, description: 'Role created' })
    @ApiResponse({ status: 400, description: `Role shouldn't be created` })
    @ApiBody({ type: CreateRoleDTO, description: 'Data to create a Role' })
    async create(@Body() body: CreateRoleDTO) {
        return this.catRoleService.create(body);
    }

    @Get()
    @HttpCode(200)
    @ApiResponse({ status: 200, description: 'Return all Roles' })
    @ApiResponse({ status: 404, description: 'Role not found' })
    async findAll() {
        return this.catRoleService.findAll();
    }

    @Get(':id')
    @HttpCode(200)
    @ApiResponse({ status: 200, description: 'Return role by id' })
    @ApiResponse({ status: 404, description: 'Role not found' })
    async findById(@Param('id') id: string) {
        return this.catRoleService.findById(id);
    }
}
