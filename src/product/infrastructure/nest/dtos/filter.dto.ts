import { ApiPropertyOptional } from "@nestjs/swagger";
import { Transform, Type } from "class-transformer";
import { IsBoolean, IsEnum, IsMongoId, IsNumber, IsOptional, IsString, Max, MaxLength, Min } from "class-validator";
import { SortByFields } from "../../../domain/enum/sort-by-fields.enum";
import { SortOrder } from "../../../domain/enum/sort-order.enum";

export class FilterOptionsDTO {
    @IsOptional()
    @IsNumber()
    @Min(1)
    @Type(() => Number)
    @ApiPropertyOptional({
        description: 'Page number for pagination',
        example: 1,
        type: Number,
        minimum: 1,
        default: 1
    })
    page?: number = 1;

    @IsOptional()
    @IsNumber()
    @Min(1)
    @Max(100)
    @Type(() => Number)
    @ApiPropertyOptional({
        description: 'Number of items per page',
        example: 10,
        type: Number,
        minimum: 1,
        maximum: 100,
        default: 10
    })
    limit?: number = 10;

    @IsOptional()
    @IsEnum(SortByFields)
    @ApiPropertyOptional({
        description: 'Field to sort by',
        example: SortByFields.CREATED_AT,
        enum: SortByFields,
        default: SortByFields.CREATED_AT
    })
    sortBy?: SortByFields = SortByFields.CREATED_AT;

    @IsOptional()
    @IsEnum(SortOrder)
    @ApiPropertyOptional({
        description: 'Sort order',
        example: SortOrder.DESC,
        enum: SortOrder,
        default: SortOrder.DESC
    })
    sortOrder?: SortOrder = SortOrder.DESC;

    @IsOptional()
    @IsBoolean()
    @Transform(({ value }) => {
        if (value === 'true') return true;
        if (value === 'false') return false;
        return value;
    })
    @ApiPropertyOptional({
        description: 'Filter by active status',
        example: true,
        type: Boolean
    })
    isActive?: boolean;

    @IsOptional()
    @IsString()
    @MaxLength(100)
    @ApiPropertyOptional({
        description: 'Search term for product name or description',
        example: 'lavender soap',
        type: String,
        maxLength: 100
    })
    search?: string;

    @IsOptional()
    @IsNumber()
    @Min(0)
    @Type(() => Number)
    @ApiPropertyOptional({
        description: 'Minimum price filter',
        example: 10.00,
        type: Number,
        minimum: 0
    })
    priceMin?: number;

    @IsOptional()
    @IsNumber()
    @Min(0)
    @Type(() => Number)
    @ApiPropertyOptional({
        description: 'Maximum price filter',
        example: 100.00,
        type: Number,
        minimum: 0
    })
    priceMax?: number;

    @IsOptional()
    @IsBoolean()
    @Transform(({ value }) => {
        if (value === 'true') return true;
        if (value === 'false') return false;
        return value;
    })
    @ApiPropertyOptional({
        description: 'Filter products with stock available',
        example: true,
        type: Boolean
    })
    hasStock?: boolean;

    @IsOptional()
    @IsMongoId()
    @ApiPropertyOptional({
        description: 'Filter by brand ID',
        example: '60c72b2f9b1e8b001c8e4d5d',
        type: String
    })
    brandId?: string;

    @IsOptional()
    @IsMongoId()
    @ApiPropertyOptional({
        description: 'Filter by color ID',
        example: '60c72b2f9b1e8b001c8e4d5a',
        type: String
    })
    colorId?: string;

    @IsOptional()
    @IsMongoId()
    @ApiPropertyOptional({
        description: 'Filter by essence ID',
        example: '60c72b2f9b1e8b001c8e4d5b',
        type: String
    })
    essenceId?: string;

    @IsOptional()
    @IsMongoId()
    @ApiPropertyOptional({
        description: 'Filter by associated emotion ID',
        example: '60c72b2f9b1e8b001c8e4d5c',
        type: String
    })
    associatedEmotionId?: string;

    @IsOptional()
    @IsMongoId()
    @ApiPropertyOptional({
        description: 'Filter by sub-category ID',
        example: '60c72b2f9b1e8b001c8e4d5e',
        type: String
    })
    subCategoryId?: string;

    @IsOptional()
    @IsNumber()
    @Min(0)
    @Type(() => Number)
    @ApiPropertyOptional({
        description: 'Minimum stock quantity filter',
        example: 5,
        type: Number,
        minimum: 0
    })
    stockMin?: number;

    @IsOptional()
    @IsNumber()
    @Min(0)
    @Type(() => Number)
    @ApiPropertyOptional({
        description: 'Maximum stock quantity filter',
        example: 100,
        type: Number,
        minimum: 0
    })
    stockMax?: number;
}