import { ApiProperty, ApiPropertyOptional, PartialType } from "@nestjs/swagger";
import { IsArray, IsMongoId, IsNotEmpty, IsNumber, IsOptional, IsString, MaxLength, Min, MinLength, } from "class-validator";

export class CreateProductDTO {
    @IsString()
    @IsNotEmpty()
    @MinLength(3)
    @MaxLength(100)
    @ApiProperty({
        description: 'Name of the product',
        example: 'Organic Lavender Soap',
        type: String,
        required: true,
        name: 'name',
        minLength: 3,
        maxLength: 100
    })
    name: string;

    @IsString()
    @IsOptional()
    @MinLength(10)
    @MaxLength(500)
    @ApiPropertyOptional({
        description: 'Description of the product',
        example: 'A soothing lavender soap made with organic ingredients.',
        type: String,
        required: false,
        name: 'description',
        minLength: 10,
        maxLength: 500
    })
    description?: string;

    @IsNumber()
    @IsNotEmpty()
    @Min(0)
    @ApiProperty({
        description: 'Price of the product',
        example: 19.99,
        type: Number,
        required: true,
        name: 'price',
        minimum: 0
    })
    price: number;

    @IsOptional()
    @IsArray()
    @IsString({ each: true })
    @ApiPropertyOptional({
        description: 'Array of image URLs for the product',
        example: ['https://example.com/image1.jpg', 'https://example.com/image2.jpg'],
        type: [String],
        required: false,
        name: 'images'
    })
    images?: string[];

    @IsNumber()
    @IsNotEmpty()
    @Min(0)
    @ApiProperty({
        description: 'Stock quantity of the product',
        example: 100,
        type: Number,
        required: true,
        name: 'stock',
        minimum: 0
    })
    stock: number;

    @IsOptional()
    @IsMongoId()
    @ApiPropertyOptional({
        description: 'ID of the color associated with the product',
        example: '60c72b2f9b1e8b001c8e4d5a',
        type: String,
        required: false,
        name: 'color'
    })
    color?: string;

    @IsOptional()
    @IsMongoId()
    @ApiPropertyOptional({
        description: 'ID of the essence associated with the product',
        example: '60c72b2f9b1e8b001c8e4d5b',
        type: String,
        required: false,
        name: 'essence'
    })
    essence?: string;

    @IsOptional()
    @IsMongoId()
    @ApiPropertyOptional({
        description: 'ID of the associated emotion for the product',
        example: '60c72b2f9b1e8b001c8e4d5c',
        type: String,
        required: false,
        name: 'associatedEmotion'
    })
    associatedEmotion?: string;

    @IsOptional()
    @IsMongoId()
    @ApiPropertyOptional({
        description: 'ID of the brand associated with the product',
        example: '60c72b2f9b1e8b001c8e4d5d',
        type: String,
        required: false,
        name: 'brand'
    })
    brand?: string;

    @IsMongoId()
    @IsNotEmpty()
    @ApiProperty({
        description: 'ID of the category associated with the product',
        example: '60c72b2f9b1e8b001c8e4d5f',
        type: String,
        required: true,
        name: 'category'
    })
    category: string;

    @IsOptional()
    @IsMongoId()
    @ApiPropertyOptional({
        description: 'ID of the sub-category associated with the product',
        example: '60c72b2f9b1e8b001c8e4d5e',
        type: String,
        required: false,
        name: 'subCategory'
    })
    subCategory?: string;
}

export class UpdateProductDTO extends PartialType(CreateProductDTO) { }
