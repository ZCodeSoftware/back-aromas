import { ApiProperty, ApiPropertyOptional } from "@nestjs/swagger";
import { IsBoolean, IsNotEmpty, IsOptional, IsString } from "class-validator";

export class CreateColorDTO {
    @IsString()
    @IsNotEmpty()
    @ApiProperty({
        description: 'Color name',
        example: 'Color Name',
        required: true,
        type: String,
    })
    name: string;


    @IsString()
    @IsNotEmpty()
    @ApiProperty({
        description: 'Color hexadecimal',
        example: 'Color hexadecimal',
        required: true,
        type: String,
    })
    hex: string;
}

export class UpdateColorDTO {
    @IsString()
    @IsOptional()
    @ApiPropertyOptional({
        description: 'Color name',
        example: 'Color Name',
        type: String,
    })
    name?: string;

    @IsString()
    @IsOptional()
    @ApiPropertyOptional({
        description: 'Color hexadecimal',
        example: 'Color hexadecimal',
        type: String,
    })
    hex?: string;

    @IsBoolean()
    @IsOptional()
    @ApiPropertyOptional({
        description: 'Soft-delete flag. Send false to deactivate, true to restore',
        example: true,
        type: Boolean,
    })
    isActive?: boolean;
}
