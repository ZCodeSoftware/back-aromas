import { ApiProperty, ApiPropertyOptional } from "@nestjs/swagger";
import { IsBoolean, IsNotEmpty, IsOptional, IsString } from "class-validator";


export class CreateSubCategoryDTO {
    @IsString()
    @IsNotEmpty()
    @ApiProperty({
        description:'Sub Category Name',
        example: 'Sub Category Name',
        required:true,
        type: String
    })
    name:string;
}

export class UpdateSubCategoryDTO {
    @IsString()
    @IsOptional()
    @ApiPropertyOptional({
        description: 'Sub Category Name',
        example: 'Sub Category Name',
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
