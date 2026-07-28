import { ApiProperty, ApiPropertyOptional, PartialType } from "@nestjs/swagger";
import { Type } from "class-transformer";
import { IsBoolean, IsInt, IsMongoId, IsNotEmpty, IsOptional, IsString, Max, MaxLength, Min } from "class-validator";

export class CreateReviewDTO {
    @IsMongoId()
    @IsNotEmpty()
    @ApiProperty({
        description: 'ID of the reviewed product. You must have a completed purchase of it',
        example: '60c72b2f9b1e8b001c8e4d5d',
        type: String,
        required: true,
        name: 'productId',
    })
    productId: string;

    @IsInt()
    @Min(1)
    @Max(5)
    @Type(() => Number)
    @ApiProperty({
        description: 'Score from 1 to 5',
        example: 5,
        type: Number,
        required: true,
        name: 'rating',
        minimum: 1,
        maximum: 5,
    })
    rating: number;

    @IsOptional()
    @IsString()
    @MaxLength(500)
    @ApiPropertyOptional({
        description: 'Free text opinion',
        example: 'El aroma dura muchísimo, lo vuelvo a comprar',
        type: String,
        required: false,
        name: 'comment',
        maxLength: 500,
    })
    comment?: string;
}

export class UpdateReviewDTO extends PartialType(CreateReviewDTO) {
    @IsOptional()
    @IsBoolean()
    @ApiPropertyOptional({
        description: 'Visibility of the review. Administrators only',
        example: false,
        type: Boolean,
        required: false,
        name: 'isActive',
    })
    isActive?: boolean;
}

export class FilterReviewDTO {
    @IsOptional()
    @IsInt()
    @Min(1)
    @Type(() => Number)
    @ApiPropertyOptional({
        description: 'Page number for pagination',
        example: 1,
        type: Number,
        minimum: 1,
        default: 1,
    })
    page?: number = 1;

    @IsOptional()
    @IsInt()
    @Min(1)
    @Max(100)
    @Type(() => Number)
    @ApiPropertyOptional({
        description: 'Number of items per page',
        example: 10,
        type: Number,
        minimum: 1,
        maximum: 100,
        default: 10,
    })
    limit?: number = 10;
}
