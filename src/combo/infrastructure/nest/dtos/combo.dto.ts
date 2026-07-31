import { ApiProperty, ApiPropertyOptional, PartialType } from "@nestjs/swagger";
import { Type } from "class-transformer";
import {
    ArrayMinSize,
    IsArray,
    IsBoolean,
    IsEnum,
    IsMongoId,
    IsNotEmpty,
    IsNumber,
    IsOptional,
    IsString,
    Max,
    MaxLength,
    Min,
    MinLength,
    ValidateNested,
} from "class-validator";
import { ComboPriceMode } from "../../../domain/enum/combo-price-mode.enum";

export class ComboItemDTO {
    @IsMongoId()
    @IsNotEmpty()
    @ApiProperty({
        description: 'ID of the product that is part of the combo',
        example: '60c72b2f9b1e8b001c8e4d5a',
        type: String,
        required: true,
        name: 'productId'
    })
    productId: string;

    @IsNumber()
    @IsNotEmpty()
    @Min(1)
    @ApiProperty({
        description: 'How many units of this product a single combo carries',
        example: 2,
        type: Number,
        required: true,
        name: 'quantity',
        minimum: 1
    })
    quantity: number;
}

export class CreateComboDTO {
    @IsString()
    @IsNotEmpty()
    @MinLength(3)
    @MaxLength(100)
    @ApiProperty({
        description: 'Name of the combo',
        example: 'Combo Relax',
        type: String,
        required: true,
        name: 'name',
        minLength: 3,
        maxLength: 100
    })
    name: string;

    @IsString()
    @IsOptional()
    @MaxLength(500)
    @ApiPropertyOptional({
        description: 'Description of the combo',
        example: 'Two lavender candles and a sandalwood incense.',
        type: String,
        required: false,
        name: 'description',
        maxLength: 500
    })
    description?: string;

    @IsOptional()
    @IsArray()
    @IsString({ each: true })
    @ApiPropertyOptional({
        description: 'Array of image URLs for the combo',
        example: ['https://example.com/combo.jpg'],
        type: [String],
        required: false,
        name: 'images'
    })
    images?: string[];

    @IsArray()
    @ArrayMinSize(1)
    @ValidateNested({ each: true })
    @Type(() => ComboItemDTO)
    @ApiProperty({
        description: 'Products the combo is made of, with the units of each',
        type: [ComboItemDTO],
        required: true,
        name: 'items'
    })
    items: ComboItemDTO[];

    @IsEnum(ComboPriceMode)
    @IsNotEmpty()
    @ApiProperty({
        description: 'FIXED prices the combo outright, PERCENTAGE discounts the sum of its products',
        enum: ComboPriceMode,
        example: ComboPriceMode.PERCENTAGE,
        required: true,
        name: 'priceMode'
    })
    priceMode: ComboPriceMode;

    /** Required when priceMode is FIXED; the domain model enforces the pairing. */
    @IsOptional()
    @IsNumber()
    @Min(0)
    @ApiPropertyOptional({
        description: 'Final price of the combo. Required when priceMode is FIXED',
        example: 9900,
        type: Number,
        required: false,
        name: 'fixedPrice',
        minimum: 0
    })
    fixedPrice?: number;

    /** Required when priceMode is PERCENTAGE; the domain model enforces the pairing. */
    @IsOptional()
    @IsNumber()
    @Min(0)
    @Max(100)
    @ApiPropertyOptional({
        description: 'Discount off the sum of the products. Required when priceMode is PERCENTAGE',
        example: 20,
        type: Number,
        required: false,
        name: 'discountPercentage',
        minimum: 0,
        maximum: 100
    })
    discountPercentage?: number;
}

export class UpdateComboDTO extends PartialType(CreateComboDTO) {
    @IsBoolean()
    @IsOptional()
    @ApiPropertyOptional({
        description: 'Indicates if the combo is active',
        example: true,
        type: Boolean,
        required: false,
        name: 'isActive'
    })
    isActive?: boolean;
}
