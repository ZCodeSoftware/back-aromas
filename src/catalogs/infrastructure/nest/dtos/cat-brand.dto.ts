import { ApiProperty, ApiPropertyOptional } from "@nestjs/swagger";
import { IsBoolean, IsNotEmpty, IsOptional, IsString } from "class-validator";



export class CreateBrandDTO {
    @IsString()
    @IsNotEmpty()
    @ApiProperty({
        description: 'Brand name',
        example: 'Brand Name',
        required: true,
        type: String,
    })
    name: string;
}

export class UpdateBrandDTO {
    @IsString()
    @IsOptional()
    @ApiPropertyOptional({
        description: 'Brand name',
        example: 'Brand Name',
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
