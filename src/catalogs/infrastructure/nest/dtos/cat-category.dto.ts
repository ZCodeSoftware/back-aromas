import { ApiProperty, ApiPropertyOptional } from "@nestjs/swagger";
import { IsArray, IsBoolean, IsNotEmpty, IsOptional, IsString } from "class-validator";


export class CreateCategoryDTO {
    @IsString()
    @IsNotEmpty()
    @ApiProperty({
        description: 'Category name',
        example: 'Category name',
        required: true,
        type: String,
    })
    name: string;

    @IsArray()
    @IsOptional()
    @ApiProperty(
        {
            description: 'Sub-Categories id',
            example: 'Sub-Categories id',
            required: false,
            type: [String],
        }
    )
    subCategories?: string[];
}

export class UpdateCategoryDTO {
    @IsString()
    @IsOptional()
    @ApiPropertyOptional({
        description: 'Category name',
        example: 'Category name',
        type: String,
    })
    name?: string;

    @IsArray()
    @IsOptional()
    @ApiPropertyOptional({
        description: 'Sub-Categories id',
        example: 'Sub-Categories id',
        type: [String],
    })
    subCategories?: string[];

    @IsBoolean()
    @IsOptional()
    @ApiPropertyOptional({
        description: 'Soft-delete flag. Send false to deactivate, true to restore',
        example: true,
        type: Boolean,
    })
    isActive?: boolean;
}
