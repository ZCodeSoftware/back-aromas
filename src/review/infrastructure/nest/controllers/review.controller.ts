import { Body, Controller, Delete, Get, HttpCode, Inject, Param, Post, Put, Query, UseGuards } from "@nestjs/common";
import { ApiBody, ApiResponse, ApiTags } from "@nestjs/swagger";
import { Roles } from "../../../../auth/infrastructure/nest/decorators/roles.decorator";
import { AuthGuards } from "../../../../auth/infrastructure/nest/guards/auth.guard";
import { RoleGuards } from "../../../../auth/infrastructure/nest/guards/role.guard";
import { TypeRoles } from "../../../../core/domain/enums/type-roles.enum";
import { CurrentUser } from "../../../../core/infrastructure/nest/decorators/current-user.decorator";
import { IReviewService } from "../../../domain/services/review.interface.service";
import SymbolsReview from "../../../symbols-review";
import { CreateReviewDTO, FilterReviewDTO, UpdateReviewDTO } from "../dtos/review.dto";

@ApiTags('review')
@Controller('review')
export class ReviewController {
    constructor(
        @Inject(SymbolsReview.IReviewService)
        private readonly reviewService: IReviewService
    ) { }

    @Post()
    @HttpCode(201)
    @UseGuards(AuthGuards)
    @ApiResponse({ status: 401, description: 'Unauthorized' })
    @ApiResponse({ status: 201, description: 'Review created' })
    @ApiResponse({ status: 400, description: 'You already reviewed this product' })
    @ApiResponse({ status: 403, description: 'You can only review products you purchased' })
    @ApiResponse({ status: 404, description: 'Product not found' })
    @ApiBody({ type: CreateReviewDTO, description: 'Data to create a Review' })
    async create(@CurrentUser('_id') userId: string, @Body() body: CreateReviewDTO) {
        return this.reviewService.create(userId, body);
    }

    @Get('me')
    @HttpCode(200)
    @UseGuards(AuthGuards)
    @ApiResponse({ status: 401, description: 'Unauthorized' })
    @ApiResponse({ status: 200, description: 'Paginated reviews written by the authenticated user' })
    async findMine(@CurrentUser('_id') userId: string, @Query() options: FilterReviewDTO) {
        return this.reviewService.findByUser(userId, options);
    }

    @Get('product/:productId')
    @HttpCode(200)
    @ApiResponse({ status: 200, description: 'Paginated active reviews of a product' })
    async findByProduct(@Param('productId') productId: string, @Query() options: FilterReviewDTO) {
        return this.reviewService.findByProduct(productId, options);
    }

    // Admin-only: the storefront keeps seeing the active reviews only, while the
    // dashboard needs the moderated ones listed to be able to restore them.
    @Get('product/:productId/all')
    @HttpCode(200)
    @UseGuards(AuthGuards, RoleGuards)
    @Roles(TypeRoles.ADMIN)
    @ApiResponse({ status: 200, description: 'Paginated reviews of a product, deactivated ones included' })
    @ApiResponse({ status: 401, description: 'Unauthorized' })
    @ApiResponse({ status: 403, description: 'Admin role required' })
    async findByProductIncludingInactive(
        @Param('productId') productId: string,
        @Query() options: FilterReviewDTO,
    ) {
        return this.reviewService.findByProduct(productId, options, true);
    }

    @Put(':id')
    @HttpCode(200)
    @UseGuards(AuthGuards)
    @ApiResponse({ status: 401, description: 'Unauthorized' })
    @ApiResponse({ status: 403, description: 'The review belongs to another user, or isActive requires an admin' })
    @ApiResponse({ status: 404, description: 'Review not found' })
    @ApiResponse({ status: 200, description: 'Review updated' })
    @ApiBody({ type: UpdateReviewDTO, description: 'Data to update a Review' })
    async update(
        @Param('id') id: string,
        @CurrentUser('_id') userId: string,
        @Body() body: UpdateReviewDTO,
    ) {
        return this.reviewService.update(id, userId, body);
    }

    @Delete(':id')
    @HttpCode(200)
    @UseGuards(AuthGuards)
    @ApiResponse({ status: 401, description: 'Unauthorized' })
    @ApiResponse({ status: 403, description: 'The review belongs to another user' })
    @ApiResponse({ status: 404, description: 'Review not found' })
    @ApiResponse({ status: 200, description: 'Review deactivated (soft delete)' })
    async delete(@Param('id') id: string, @CurrentUser('_id') userId: string) {
        return this.reviewService.delete(id, userId);
    }
}
