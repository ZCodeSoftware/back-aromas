import { Body, Controller, Delete, Get, HttpCode, Inject, Param, Post, Put, UseGuards } from "@nestjs/common";
import { ApiBody, ApiResponse, ApiTags } from "@nestjs/swagger";
import SymbolsCatalogs from "../../../symbols-catalogs";
import { ICatAssociatedEmotionService } from "../../../domain/services/cat-associated-emotion.service";
import { Roles } from "../../../../auth/infrastructure/nest/decorators/roles.decorator";
import { AuthGuards } from "../../../../auth/infrastructure/nest/guards/auth.guard";
import { RoleGuards } from "../../../../auth/infrastructure/nest/guards/role.guard";
import { TypeRoles } from "../../../../core/domain/enums/type-roles.enum";
import { CreateAssociatedEmotionDTO, UpdateAssociatedEmotionDTO } from "../dtos/cat-associated-emotion.dto";

@ApiTags('cat-associated-emotion')
@Controller('cat-associated-emotion')
export class CatAssociatedEmotionController {
    constructor(
        @Inject(SymbolsCatalogs.ICatAssociatedEmotionService) private readonly catAssociatedEmotionService: ICatAssociatedEmotionService
    ) { }

    @Post()
    @UseGuards(AuthGuards, RoleGuards)
    @Roles(TypeRoles.ADMIN)
    @HttpCode(201)
    @ApiResponse(
        {
            status: 201,
            description: 'Associated Emotion Created'
        }
    )
    @ApiResponse(
        {
            status: 400,
            description: `Associated Emotion shouldn't be created`
        }
    )
    async create(@Body() body: CreateAssociatedEmotionDTO) {
        return this.catAssociatedEmotionService.create(body)
    }

    @Get()
    @HttpCode(200)
    @ApiResponse(
        {
            status: 200,
            description: 'Return All Associated Emotions'
        }
    )
    @ApiResponse(
        {
            status: 404,
            description: 'Associated Emotions not Found'
        }
    )
    async findAll() {
        return this.catAssociatedEmotionService.findAll();
    }
    
    
    @Get(':id')
    @HttpCode(200)
    @ApiResponse(
        {
            status: 200,
            description: 'Return Associated Emotions by id'
        }
    )
    @ApiResponse(
        {
            status: 404,
            description: 'Associated Emotion not Found'
        }
    )
    async findById(@Param('id') id:string ){
        return this.catAssociatedEmotionService.findById(id);
    }

    @Put(':id')
    @UseGuards(AuthGuards, RoleGuards)
    @Roles(TypeRoles.ADMIN)
    @HttpCode(200)
    @ApiResponse(
        {
            status: 200,
            description: 'Associated Emotion updated'
        }
    )
    @ApiResponse(
        {
            status: 404,
            description: 'Associated Emotion not Found'
        }
    )
    @ApiBody({ type: UpdateAssociatedEmotionDTO, description: 'Data to update an Associated Emotion' })
    async update(@Param('id') id: string, @Body() body: UpdateAssociatedEmotionDTO) {
        return this.catAssociatedEmotionService.update(id, body);
    }

    @Delete(':id')
    @UseGuards(AuthGuards, RoleGuards)
    @Roles(TypeRoles.ADMIN)
    @HttpCode(200)
    @ApiResponse(
        {
            status: 200,
            description: 'Associated Emotion deactivated (soft delete)'
        }
    )
    @ApiResponse(
        {
            status: 404,
            description: 'Associated Emotion not Found'
        }
    )
    async delete(@Param('id') id: string) {
        return this.catAssociatedEmotionService.delete(id);
    }

}