import { ApiProperty, ApiPropertyOptional } from "@nestjs/swagger";
import { IsBoolean, IsNotEmpty, IsOptional, IsString } from "class-validator";

export class CreateTypeHousingDTO {
    @IsString()
    @IsNotEmpty()
    @ApiProperty({
        description: 'Type Housing name',
        example: 'Type Housing name',
        required: true,
        type: String,
    })
    name: string;
}

export class UpdateTypeHousingDTO {
    @IsString()
    @IsOptional()
    @ApiPropertyOptional({
        description: 'Type Housing name',
        example: 'Type Housing name',
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
