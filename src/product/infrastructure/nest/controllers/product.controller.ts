import { Body, Controller, Get, HttpCode, Inject, Param, Post, Query } from "@nestjs/common";
import { ApiBody, ApiResponse, ApiTags } from "@nestjs/swagger";
import { IProductService } from "../../../domain/services/product.interface.service";
import SymbolsProduct from "../../../symbols-product";
import { FilterOptionsDTO } from "../dtos/filter.dto";
import { CreateProductDTO } from "../dtos/product.dto";

@ApiTags('product')
@Controller('product')
export class ProductController {
    constructor(
        @Inject(SymbolsProduct.IProductService)
        private readonly productService: IProductService
    ) { }

    @Post()
    @HttpCode(201)
    @ApiResponse({ status: 201, description: 'Product created' })
    @ApiResponse({ status: 400, description: `Product shouldn't be created` })
    @ApiBody({ type: CreateProductDTO, description: 'Data to create a Product' })
    async create(@Body() body: CreateProductDTO) {
        return this.productService.create(body);
    }

    @Get()
    @HttpCode(200)
    @ApiResponse({ status: 200, description: 'Return all Products' })
    @ApiResponse({ status: 404, description: 'Product not found' })
    async findAll(@Query() options: FilterOptionsDTO) {
        return this.productService.findAll(options);
    }

    @Get(':id')
    @HttpCode(200)
    @ApiResponse({ status: 200, description: 'Return Product by id' })
    @ApiResponse({ status: 404, description: 'Product not found' })
    async findById(@Param('id') id: string) {
        return this.productService.findById(id);
    }
}
