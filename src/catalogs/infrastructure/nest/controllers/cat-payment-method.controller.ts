import { Body, Controller, Get, HttpCode, Inject, Param, Post, UseGuards } from "@nestjs/common";
import { ApiResponse, ApiTags } from "@nestjs/swagger";
import { AuthGuards } from "../../../../auth/infrastructure/nest/guards/auth.guard";
import { RoleGuards } from "../../../../auth/infrastructure/nest/guards/role.guard";
import { ICatPaymentMethodService } from "../../../domain/services/cat-payment-method.service";
import SymbolsCatalogs from "../../../symbols-catalogs";
import { CreatePaymentMethodDTO } from "../dtos/cat-payment-method.dto";



@ApiTags('cat-payment-method')
@Controller('cat-payment-method')
export class CatPaymentMethodController {
    constructor(
        @Inject(SymbolsCatalogs.ICatPaymentMethodService) private readonly catPaymentMethodService: ICatPaymentMethodService
    ) { }

    @Post()
    @UseGuards(AuthGuards, RoleGuards)
    @HttpCode(201)
    @ApiResponse(
        {
            status: 201,
            description: 'Payment Method Created'
        }
    )
    @ApiResponse(
        {
            status: 400,
            description: `Payment Method shouldn't be created`
        }
    )
    async create(@Body() body: CreatePaymentMethodDTO) {
        return this.catPaymentMethodService.create(body)
    }

    @Get()
    @HttpCode(200)
    @ApiResponse(
        {
            status: 200,
            description: 'Return All Payment Method'
        }
    )
    @ApiResponse(
        {
            status: 400,
            description: `Payment Method not found`
        }
    )
    async findAll() {
        return this.catPaymentMethodService.findAll();
    }

    @Get(':id')
    @HttpCode(200)
    @ApiResponse(
        {
            status: 200,
            description: 'Return Payment Method by id'
        }
    )
    @ApiResponse(
        {
            status: 404,
            description: 'Payment Method not Found'
        }
    )
    async findById(@Param('id') id: string) {
        return this.catPaymentMethodService.findById(id);
    }


}