import { ApiProperty, ApiPropertyOptional, PartialType } from "@nestjs/swagger";
import { Transform, Type } from "class-transformer";
import {
    IsArray,
    IsBoolean,
    IsDate,
    IsEnum,
    IsMongoId,
    IsNotEmpty,
    IsNumber,
    IsOptional,
    IsString,
    Matches,
    Max,
    MaxLength,
    Min,
    MinLength,
} from "class-validator";
import { PromotionScope } from "../../../domain/enum/promotion-scope.enum";
import { PromotionValueType } from "../../../domain/enum/promotion-value-type.enum";

export class CreatePromotionDTO {
    @IsString()
    @IsNotEmpty()
    @MinLength(3)
    @MaxLength(100)
    @ApiProperty({
        description: 'Name of the promotion, shown in the dashboard and on the order',
        example: '10% en Velas',
        type: String,
        required: true,
        name: 'name',
        minLength: 3,
        maxLength: 100
    })
    name: string;

    @IsOptional()
    @IsString()
    @MaxLength(300)
    @ApiPropertyOptional({
        description: 'Internal note about the promotion',
        example: 'Campaña de invierno',
        type: String,
        required: false,
        name: 'description'
    })
    description?: string;

    @IsEnum(PromotionScope)
    @IsNotEmpty()
    @ApiProperty({
        description: 'What the promotion reaches. A scoped one needs its matching list filled in',
        enum: PromotionScope,
        example: PromotionScope.CATEGORY,
        required: true,
        name: 'scope'
    })
    scope: PromotionScope;

    @IsOptional()
    @IsArray()
    @IsMongoId({ each: true })
    @ApiPropertyOptional({
        description: 'Categories reached. Required when scope is CATEGORY',
        type: [String],
        required: false,
        name: 'categories'
    })
    categories?: string[];

    @IsOptional()
    @IsArray()
    @IsMongoId({ each: true })
    @ApiPropertyOptional({
        description: 'Sub-categories reached. Required when scope is SUBCATEGORY',
        type: [String],
        required: false,
        name: 'subCategories'
    })
    subCategories?: string[];

    @IsOptional()
    @IsArray()
    @IsMongoId({ each: true })
    @ApiPropertyOptional({
        description: 'Products reached. Required when scope is PRODUCTS',
        type: [String],
        required: false,
        name: 'products'
    })
    products?: string[];

    @IsOptional()
    @IsArray()
    @IsMongoId({ each: true })
    @ApiPropertyOptional({
        description: 'Combos reached. Required when scope is COMBOS',
        type: [String],
        required: false,
        name: 'combos'
    })
    combos?: string[];

    @IsEnum(PromotionValueType)
    @IsNotEmpty()
    @ApiProperty({
        description: 'PERCENTAGE takes a share off each matching line; FIXED takes a flat amount off the order',
        enum: PromotionValueType,
        example: PromotionValueType.PERCENTAGE,
        required: true,
        name: 'valueType'
    })
    valueType: PromotionValueType;

    @IsNumber()
    @Min(0.01)
    @Max(1000000)
    @ApiProperty({
        description: 'The discount itself: a percentage (1-100) or an amount',
        example: 10,
        type: Number,
        required: true,
        name: 'value'
    })
    value: number;

    /** Absent means automatic: it applies on its own, with nothing to type in. */
    @IsOptional()
    @IsString()
    @MinLength(3)
    @MaxLength(50)
    @Transform(({ value }) => (typeof value === 'string' ? value.trim().toUpperCase() : value))
    @Matches(/^[A-Z0-9_-]+$/, {
        message: 'The coupon code can only contain letters, numbers, hyphens and underscores',
    })
    @ApiPropertyOptional({
        description: 'Coupon code. Leave it out for a promotion that applies on its own',
        example: 'BIENVENIDA',
        type: String,
        required: false,
        name: 'code'
    })
    code?: string;

    @IsOptional()
    @IsDate()
    @Type(() => Date)
    @ApiPropertyOptional({
        description: 'When the promotion starts. Omit for "already in force"',
        example: '2026-08-01T00:00:00.000Z',
        type: Date,
        required: false,
        name: 'startsAt'
    })
    startsAt?: Date;

    @IsOptional()
    @IsDate()
    @Type(() => Date)
    @ApiPropertyOptional({
        description: 'When the promotion ends. Omit for "no end date"',
        example: '2026-08-07T23:59:59.000Z',
        type: Date,
        required: false,
        name: 'endsAt'
    })
    endsAt?: Date;

    @IsOptional()
    @IsNumber()
    @Min(0)
    @ApiPropertyOptional({
        description: 'Minimum gross subtotal for the promotion to apply. Shipping is excluded',
        example: 8000,
        type: Number,
        required: false,
        name: 'minPurchase'
    })
    minPurchase?: number;

    @IsOptional()
    @IsNumber()
    @Min(1)
    @ApiPropertyOptional({
        description: 'How many times the promotion can be redeemed in total',
        example: 100,
        type: Number,
        required: false,
        name: 'usageLimit'
    })
    usageLimit?: number;

    @IsOptional()
    @IsNumber()
    @Min(1)
    @ApiPropertyOptional({
        description: 'How many times one customer can redeem it. Ignored on anonymous counter sales',
        example: 1,
        type: Number,
        required: false,
        name: 'usageLimitPerUser'
    })
    usageLimitPerUser?: number;
}

export class UpdatePromotionDTO extends PartialType(CreatePromotionDTO) {
    @IsBoolean()
    @IsOptional()
    @ApiPropertyOptional({
        description: 'Indicates if the promotion is active',
        example: true,
        type: Boolean,
        required: false,
        name: 'isActive'
    })
    isActive?: boolean;
}
