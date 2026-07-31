import { Body, Controller, Delete, Get, HttpCode, Inject, Param, Patch, Post, Put, UseGuards } from "@nestjs/common";
import { ApiBody, ApiResponse, ApiTags } from "@nestjs/swagger";
import { AuthGuards } from "../../../../auth/infrastructure/nest/guards/auth.guard";
import { CurrentUser } from "../../../../core/infrastructure/nest/decorators/current-user.decorator";
import { ICartService } from "../../../domain/services/cart.interface.service";
import SymbolsCart from "../../../symbols-cart";
import { AddCartItemDTO, SetCartCouponDTO, UpdateCartItemDTO } from "../dtos/cart.dto";

@ApiTags('cart')
@Controller('cart')
export class CartController {
    constructor(
        @Inject(SymbolsCart.ICartService)
        private readonly cartService: ICartService
    ) { }

    @Get()
    @HttpCode(200)
    @UseGuards(AuthGuards)
    @ApiResponse({ status: 401, description: 'Unauthorized' })
    @ApiResponse({ status: 200, description: 'Returns the cart of the authenticated user, creating it if needed' })
    async findMine(@CurrentUser('_id') userId: string) {
        return this.cartService.getByUser(userId);
    }

    @Post('items')
    @HttpCode(201)
    @UseGuards(AuthGuards)
    @ApiResponse({ status: 401, description: 'Unauthorized' })
    @ApiResponse({ status: 201, description: 'Product or combo added to the cart' })
    @ApiResponse({ status: 400, description: 'Insufficient stock, unavailable item, or both ids sent at once' })
    @ApiResponse({ status: 404, description: 'Product or combo not found' })
    @ApiBody({ type: AddCartItemDTO, description: 'Product or combo, plus the amount to add' })
    async addItem(@CurrentUser('_id') userId: string, @Body() body: AddCartItemDTO) {
        return this.cartService.addItem(userId, body);
    }

    @Patch('items/:productId')
    @HttpCode(200)
    @UseGuards(AuthGuards)
    @ApiResponse({ status: 401, description: 'Unauthorized' })
    @ApiResponse({ status: 200, description: 'Cart line updated' })
    @ApiResponse({ status: 400, description: 'Insufficient stock' })
    @ApiResponse({ status: 404, description: 'Product is not in the cart' })
    @ApiBody({ type: UpdateCartItemDTO, description: 'New amount for the cart line' })
    async updateItem(
        @CurrentUser('_id') userId: string,
        @Param('productId') productId: string,
        @Body() body: UpdateCartItemDTO,
    ) {
        return this.cartService.updateItemQuantity(userId, productId, body.quantity);
    }

    @Delete('items/:productId')
    @HttpCode(200)
    @UseGuards(AuthGuards)
    @ApiResponse({ status: 401, description: 'Unauthorized' })
    @ApiResponse({ status: 200, description: 'Product removed from the cart' })
    @ApiResponse({ status: 404, description: 'Product is not in the cart' })
    async removeItem(@CurrentUser('_id') userId: string, @Param('productId') productId: string) {
        return this.cartService.removeItem(userId, productId);
    }

    // Combo lines get their own routes rather than sharing `items/:id`: the two ids
    // come from different collections, so one route would have to guess which.
    @Patch('combo-items/:comboId')
    @HttpCode(200)
    @UseGuards(AuthGuards)
    @ApiResponse({ status: 401, description: 'Unauthorized' })
    @ApiResponse({ status: 200, description: 'Cart line updated' })
    @ApiResponse({ status: 400, description: 'Insufficient stock' })
    @ApiResponse({ status: 404, description: 'Combo is not in the cart' })
    @ApiBody({ type: UpdateCartItemDTO, description: 'New amount for the cart line' })
    async updateComboItem(
        @CurrentUser('_id') userId: string,
        @Param('comboId') comboId: string,
        @Body() body: UpdateCartItemDTO,
    ) {
        return this.cartService.updateComboQuantity(userId, comboId, body.quantity);
    }

    @Delete('combo-items/:comboId')
    @HttpCode(200)
    @UseGuards(AuthGuards)
    @ApiResponse({ status: 401, description: 'Unauthorized' })
    @ApiResponse({ status: 200, description: 'Combo removed from the cart' })
    @ApiResponse({ status: 404, description: 'Combo is not in the cart' })
    async removeCombo(@CurrentUser('_id') userId: string, @Param('comboId') comboId: string) {
        return this.cartService.removeCombo(userId, comboId);
    }

    @Put('coupon')
    @HttpCode(200)
    @UseGuards(AuthGuards)
    @ApiResponse({ status: 401, description: 'Unauthorized' })
    @ApiResponse({ status: 200, description: 'Coupon code stored on the cart, not validated yet' })
    @ApiBody({ type: SetCartCouponDTO, description: 'Coupon code to keep on the cart' })
    async setCoupon(@CurrentUser('_id') userId: string, @Body() body: SetCartCouponDTO) {
        return this.cartService.setCoupon(userId, body.code);
    }

    @Delete('coupon')
    @HttpCode(200)
    @UseGuards(AuthGuards)
    @ApiResponse({ status: 401, description: 'Unauthorized' })
    @ApiResponse({ status: 200, description: 'Coupon code cleared' })
    async clearCoupon(@CurrentUser('_id') userId: string) {
        return this.cartService.setCoupon(userId, undefined);
    }

    @Delete()
    @HttpCode(200)
    @UseGuards(AuthGuards)
    @ApiResponse({ status: 401, description: 'Unauthorized' })
    @ApiResponse({ status: 200, description: 'Cart emptied' })
    async clear(@CurrentUser('_id') userId: string) {
        return this.cartService.clear(userId);
    }
}
