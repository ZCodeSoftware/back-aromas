import { ApiProperty, ApiPropertyOptional } from "@nestjs/swagger";
import { Type } from "class-transformer";
import { IsInt, IsMongoId, IsOptional, IsString, MaxLength, Min, ValidateIf } from "class-validator";

export class AddCartItemDTO {
    /**
     * Exactly one of productId / comboId. The ValidateIf pair is what enforces it:
     * each field is required only while the other is absent, so sending both or
     * neither fails validation instead of reaching the service.
     */
    @ValidateIf((dto: AddCartItemDTO) => !dto.comboId)
    @IsMongoId()
    @ApiPropertyOptional({
        description: 'ID of the product to add. Mutually exclusive with comboId',
        example: '60c72b2f9b1e8b001c8e4d5d',
        type: String,
        required: false,
        name: 'productId',
    })
    productId?: string;

    @ValidateIf((dto: AddCartItemDTO) => !dto.productId)
    @IsMongoId()
    @ApiPropertyOptional({
        description: 'ID of the combo to add. Mutually exclusive with productId',
        example: '60c72b2f9b1e8b001c8e4d5e',
        type: String,
        required: false,
        name: 'comboId',
    })
    comboId?: string;

    @IsInt()
    @Min(1)
    @Type(() => Number)
    @ApiProperty({
        description: 'Units to add. If the product is already in the cart the amount is accumulated',
        example: 2,
        type: Number,
        required: true,
        name: 'quantity',
        minimum: 1,
    })
    quantity: number;
}

export class UpdateCartItemDTO {
    @IsInt()
    @Min(0)
    @Type(() => Number)
    @ApiProperty({
        description: 'New amount of units for the line. Sending 0 removes the product from the cart',
        example: 3,
        type: Number,
        required: true,
        name: 'quantity',
        minimum: 0,
    })
    quantity: number;
}

export class SetCartCouponDTO {
    @IsOptional()
    @IsString()
    @MaxLength(50)
    @ApiPropertyOptional({
        description: 'Coupon code to keep on the cart. Omit it to clear the current one',
        example: 'BIENVENIDA',
        type: String,
        required: false,
        name: 'code',
    })
    code?: string;
}
