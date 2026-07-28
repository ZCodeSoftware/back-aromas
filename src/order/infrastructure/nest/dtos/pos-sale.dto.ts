import { ApiProperty, ApiPropertyOptional } from "@nestjs/swagger";
import { Type } from "class-transformer";
import {
    ArrayMaxSize,
    ArrayNotEmpty,
    IsArray,
    IsEmail,
    IsInt,
    IsMongoId,
    IsNotEmpty,
    IsOptional,
    IsString,
    MaxLength,
    Min,
    ValidateNested,
} from "class-validator";

export class PosSaleItemDTO {
    @IsMongoId()
    @IsNotEmpty()
    @ApiProperty({
        description: 'ID of the product being sold',
        example: '60c72b2f9b1e8b001c8e4d5d',
        type: String,
        required: true,
        name: 'productId',
    })
    productId: string;

    @IsInt()
    @Min(1)
    @Type(() => Number)
    @ApiProperty({
        description: 'Units sold. Repeated products are merged into a single line',
        example: 2,
        type: Number,
        required: true,
        minimum: 1,
        name: 'quantity',
    })
    quantity: number;
}

export class PosCustomerDTO {
    @IsOptional()
    @IsString()
    @MaxLength(120)
    @ApiPropertyOptional({ description: 'Buyer name', example: 'Ana Pérez', type: String })
    name?: string;

    @IsOptional()
    @IsEmail()
    @ApiPropertyOptional({ description: 'Buyer email', example: 'ana@example.com', type: String })
    email?: string;

    @IsOptional()
    @IsString()
    @MaxLength(30)
    @ApiPropertyOptional({ description: 'Buyer phone', example: '+5491122334455', type: String })
    phone?: string;

    @IsOptional()
    @IsString()
    @MaxLength(30)
    @ApiPropertyOptional({ description: 'Tax identifier for invoicing', example: '20-12345678-9', type: String })
    taxId?: string;
}

export class CreatePosSaleDTO {
    @IsArray()
    @ArrayNotEmpty()
    @ArrayMaxSize(100)
    @ValidateNested({ each: true })
    @Type(() => PosSaleItemDTO)
    @ApiProperty({
        description: 'Lines of the sale. Prices always come from the live catalogue',
        type: [PosSaleItemDTO],
        required: true,
        name: 'items',
    })
    items: PosSaleItemDTO[];

    @IsMongoId()
    @IsNotEmpty()
    @ApiProperty({
        description: 'ID of the tender type (cat-payment-method)',
        example: '60c72b2f9b1e8b001c8e4d5d',
        type: String,
        required: true,
        name: 'paymentMethod',
    })
    paymentMethod: string;

    @IsOptional()
    @IsMongoId()
    @ApiPropertyOptional({
        description:
            'Links the sale to an existing account. Mutually exclusive with `customer`: sending both is a 400. Omit both for an anonymous walk-in sale',
        example: '60c72b2f9b1e8b001c8e4d5e',
        type: String,
    })
    userId?: string;

    @IsOptional()
    @ValidateNested()
    @Type(() => PosCustomerDTO)
    @ApiPropertyOptional({
        description: 'Loose buyer data when there is no account. Mutually exclusive with `userId`',
        type: PosCustomerDTO,
    })
    customer?: PosCustomerDTO;
}
