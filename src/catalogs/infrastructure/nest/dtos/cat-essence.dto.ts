import { ApiProperty, ApiPropertyOptional } from "@nestjs/swagger";
import { IsBoolean, IsNotEmpty, IsOptional, IsString } from "class-validator";


export class CreateEssenceDTO {
    @IsString()
    @IsNotEmpty()
    @ApiProperty(
        {
            description: 'Essence name',
            example: 'Essence name',
            required: true,
            type: String,
        }
    )
    name: string;
}

export class UpdateEssenceDTO {
    @IsString()
    @IsOptional()
    @ApiPropertyOptional({
        description: 'Essence name',
        example: 'Essence name',
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
