import { ApiProperty, ApiPropertyOptional } from "@nestjs/swagger";
import { IsBoolean, IsNotEmpty, IsOptional, IsString } from "class-validator";

export class CreatePaymentMethodDTO {
    @IsString()
    @IsNotEmpty()
    @ApiProperty({
        description: 'Payment Method name',
        example: 'Payment Method name',
        required: true,
        type: String,
    })
    name: string
}

export class UpdatePaymentMethodDTO {
    @IsString()
    @IsOptional()
    @ApiPropertyOptional({
        description: 'Payment Method name',
        example: 'Payment Method name',
        type: String,
    })
    name?: string;

    @IsBoolean()
    @IsOptional()
    @ApiPropertyOptional({
        description: 'Soft-delete flag. Send false to deactivate, true to restore',
        example: true,
        type: Boolean,
    })
    isActive?: boolean;
}
