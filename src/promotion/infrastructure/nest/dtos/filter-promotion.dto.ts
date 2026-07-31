import { ApiPropertyOptional } from "@nestjs/swagger";
import { Transform, Type } from "class-transformer";
import { IsBoolean, IsNumber, IsOptional, IsString, Max, MaxLength, Min } from "class-validator";

export class FilterPromotionOptionsDTO {
    @IsOptional()
    @IsNumber()
    @Min(1)
    @Type(() => Number)
    @ApiPropertyOptional({
        description: 'Page number for pagination',
        example: 1,
        type: Number,
        minimum: 1,
        default: 1
    })
    page?: number = 1;

    @IsOptional()
    @IsNumber()
    @Min(1)
    @Max(100)
    @Type(() => Number)
    @ApiPropertyOptional({
        description: 'Number of items per page',
        example: 10,
        type: Number,
        minimum: 1,
        maximum: 100,
        default: 10
    })
    limit?: number = 10;

    @IsOptional()
    @IsString()
    @MaxLength(100)
    @ApiPropertyOptional({
        description: 'Free text matched against name and coupon code',
        example: 'velas',
        type: String
    })
    search?: string;

    @IsOptional()
    @IsBoolean()
    @Transform(({ value }) => {
        if (value === 'true') return true;
        if (value === 'false') return false;
        return value;
    })
    @ApiPropertyOptional({
        description: 'Filter by active state',
        example: true,
        type: Boolean
    })
    isActive?: boolean;
}
