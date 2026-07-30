import { Body, Controller, Delete, Get, HttpCode, Inject, Param, Post, Put, UseGuards } from "@nestjs/common";
import { ApiBody, ApiResponse, ApiTags } from "@nestjs/swagger";
import { AuthGuards } from "../../../../auth/infrastructure/nest/guards/auth.guard";
import { CurrentUser } from "../../../../core/infrastructure/nest/decorators/current-user.decorator";
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
    async create(@Body() body: CreateAddressDTO, @CurrentUser('_id') userId: string) {
        return this.addressService.create(body, userId);
    }

    @Get()
    @HttpCode(200)
    @UseGuards(AuthGuards)
    @ApiResponse({ status: 200, description: 'Addresses of the authenticated user' })
    @ApiResponse({ status: 401, description: 'Unauthorized' })
    async findMine(@CurrentUser('_id') userId: string) {
        return this.addressService.findByUser(userId);
    }

    @Get(':id')
    @HttpCode(200)
    @UseGuards(AuthGuards)
    @ApiResponse({ status: 200, description: 'Return Address by id' })
    @ApiResponse({ status: 401, description: 'Unauthorized' })
    @ApiResponse({ status: 403, description: 'The address belongs to another user' })
    @ApiResponse({ status: 404, description: 'Address not found' })
    async findById(@Param('id') id: string, @CurrentUser('_id') userId: string) {
        return this.addressService.findById(id, userId);
    }

    @Put(':id')
    @HttpCode(200)
    @UseGuards(AuthGuards)
    @ApiResponse({ status: 401, description: 'Unauthorized' })
    @ApiResponse({ status: 403, description: 'The address belongs to another user' })
    @ApiResponse({ status: 200, description: 'Address updated' })
    @ApiResponse({ status: 404, description: 'Address not found' })
    @ApiBody({ type: UpdateAddressDTO, description: 'Data to update an Address' })
    async update(
        @Param('id') id: string,
        @Body() body: UpdateAddressDTO,
        @CurrentUser('_id') userId: string,
    ) {
        return this.addressService.update(id, body, userId);
    }

    @Delete(':id')
    @HttpCode(200)
    @UseGuards(AuthGuards)
    @ApiResponse({ status: 401, description: 'Unauthorized' })
    @ApiResponse({ status: 403, description: 'The address belongs to another user' })
    @ApiResponse({ status: 200, description: 'Address deactivated (soft delete)' })
    @ApiResponse({ status: 404, description: 'Address not found' })
    async delete(@Param('id') id: string, @CurrentUser('_id') userId: string) {
        return this.addressService.delete(id, userId);
    }
}
