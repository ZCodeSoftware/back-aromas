import { Body, Controller, Delete, Get, HttpCode, Inject, Param, Post, Put, Req, UseGuards } from "@nestjs/common";
import { ApiBody, ApiResponse, ApiTags } from "@nestjs/swagger";
import { AuthGuards } from "../../../../auth/infrastructure/nest/guards/auth.guard";
import { IUserRequest } from "../../../../core/infrastructure/nest/dtos/custom-request/user.request";
import { IAddressService } from "../../../domain/services/address.interface.service";
import SymbolsAddress from "../../../symbols-address";
import { CreateAddressDTO, UpdateAddressDTO } from "../dtos/address.dto";

@ApiTags('address')
@Controller('address')
export class AddressController {
    constructor(
        @Inject(SymbolsAddress.IAddressService)
        private readonly addressService: IAddressService
    ) { }

    @Post()
    @HttpCode(201)
    @ApiResponse({ status: 201, description: 'Address created' })
    @ApiResponse({ status: 400, description: `Address shouldn't be created` })
    @ApiBody({ type: CreateAddressDTO, description: 'Data to create a Address' })
    @UseGuards(AuthGuards)
    async create(@Body() body: CreateAddressDTO, @Req() req: IUserRequest) {
        const { _id } = req.user;
        return this.addressService.create(body, _id);
    }

    @Get()
    @HttpCode(200)
    @ApiResponse({ status: 200, description: 'Return all Addresss' })
    @ApiResponse({ status: 404, description: 'Address not found' })
    async findAll() {
        return this.addressService.findAll();
    }

    @Get(':id')
    @HttpCode(200)
    @ApiResponse({ status: 200, description: 'Return Address by id' })
    @ApiResponse({ status: 404, description: 'Address not found' })
    async findById(@Param('id') id: string) {
        return this.addressService.findById(id);
    }

    @Put(':id')
    @HttpCode(200)
    @UseGuards(AuthGuards)
    @ApiResponse({ status: 401, description: 'Unauthorized' })
    @ApiResponse({ status: 200, description: 'Product updated' })
    @ApiResponse({ status: 404, description: 'Product not found' })
    @ApiBody({ type: UpdateAddressDTO, description: 'Data to update a Product' })
    async update(@Param('id') id: string, @Body() body: UpdateAddressDTO) {
        return this.addressService.update(id, body);
    }

    @Delete(':id')
    @HttpCode(200)
    @UseGuards(AuthGuards)
    @ApiResponse({ status: 401, description: 'Unauthorized' })
    @ApiResponse({ status: 200, description: 'Address deactivated (soft delete)' })
    @ApiResponse({ status: 404, description: 'Address not found' })
    async delete(@Param('id') id: string) {
        return this.addressService.delete(id);
    }
}
