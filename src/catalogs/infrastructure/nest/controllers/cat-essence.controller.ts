import { Body, Controller, Delete, Get, HttpCode, Inject, Param, Post, Put, UseGuards } from "@nestjs/common";
import { ApiBody, ApiResponse, ApiTags } from "@nestjs/swagger";
import SymbolsCatalogs from "../../../symbols-catalogs";
import { ICatEssenceService } from "../../../domain/services/cat-essence.service";
import { Roles } from "../../../../auth/infrastructure/nest/decorators/roles.decorator";
import { AuthGuards } from "../../../../auth/infrastructure/nest/guards/auth.guard";
import { RoleGuards } from "../../../../auth/infrastructure/nest/guards/role.guard";
import { TypeRoles } from "../../../../core/domain/enums/type-roles.enum";
import { CreateEssenceDTO, UpdateEssenceDTO } from "../dtos/cat-essence.dto";


@ApiTags('cat-essence')
@Controller('cat-essence')
export class CatEssenceController {
    constructor(
        @Inject(SymbolsCatalogs.ICatEssenceService) private readonly catEssenceService: ICatEssenceService
    ) { }

    @Post()
    @UseGuards(AuthGuards, RoleGuards)
    @Roles(TypeRoles.ADMIN)
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

    // Declared before `:id` so the literal route wins the match. Admin-only: the
    // storefront keeps seeing active rows only, the dashboard needs the deactivated
    // ones listed to be able to restore them.
    @Get('all')
    @UseGuards(AuthGuards, RoleGuards)
    @Roles(TypeRoles.ADMIN)
    @HttpCode(200)
    @ApiResponse({ status: 200, description: 'Return all Essences, deactivated ones included' })
    @ApiResponse({ status: 401, description: 'Unauthorized' })
    @ApiResponse({ status: 403, description: 'Admin role required' })
    async findAllIncludingInactive() {
        return this.catEssenceService.findAll(true);
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

    @Put(':id')
    @UseGuards(AuthGuards, RoleGuards)
    @Roles(TypeRoles.ADMIN)
    @HttpCode(200)
    @ApiResponse(
        {
            status: 200,
            description: 'Essence updated'
        }
    )
    @ApiResponse(
        {
            status: 404,
            description: 'Essence not Found'
        }
    )
    @ApiBody({ type: UpdateEssenceDTO, description: 'Data to update an Essence' })
    async update(@Param('id') id: string, @Body() body: UpdateEssenceDTO) {
        return this.catEssenceService.update(id, body);
    }

    @Delete(':id')
    @UseGuards(AuthGuards, RoleGuards)
    @Roles(TypeRoles.ADMIN)
    @HttpCode(200)
    @ApiResponse(
        {
            status: 200,
            description: 'Essence deactivated (soft delete)'
        }
    )
    @ApiResponse(
        {
            status: 404,
            description: 'Essence not Found'
        }
    )
    async delete(@Param('id') id: string) {
        return this.catEssenceService.delete(id);
    }


}