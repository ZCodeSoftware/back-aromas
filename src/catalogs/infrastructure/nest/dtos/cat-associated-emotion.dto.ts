import { ApiProperty, ApiPropertyOptional } from "@nestjs/swagger";
import { IsBoolean, IsNotEmpty, IsOptional, IsString } from "class-validator";

export class CreateAssociatedEmotionDTO {
    @IsString()
    @IsNotEmpty()
    @ApiProperty({
        description: 'Associated Emotion name',
        example: 'Associated Emotion Name',
        required: true,
        type: String,
    })
    name: string;
}

export class UpdateAssociatedEmotionDTO {
    @IsString()
    @IsOptional()
    @ApiPropertyOptional({
        description: 'Associated Emotion name',
        example: 'Associated Emotion Name',
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
