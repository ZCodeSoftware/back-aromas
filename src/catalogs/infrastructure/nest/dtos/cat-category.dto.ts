import { ApiProperty } from "@nestjs/swagger";
import { IsArray, IsNotEmpty, IsOptional, IsString } from "class-validator";


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