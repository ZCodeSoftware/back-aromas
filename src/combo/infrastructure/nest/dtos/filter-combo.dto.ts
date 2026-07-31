import { ApiPropertyOptional } from "@nestjs/swagger";
import { Transform, Type } from "class-transformer";
import { IsBoolean, IsNumber, IsOptional, IsString, Max, MaxLength, Min } from "class-validator";

/** Same boolean coercion the product filter uses: query strings arrive as text. */
const toBoolean = ({ value }: { value: any }) => {
    if (value === 'true') return true;
    if (value === 'false') return false;
    return value;
};

export class FilterComboOptionsDTO {
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
        description: 'Free text matched against name and description',
        example: 'relax',
        type: String
    })
    search?: string;

    @IsOptional()
    @IsBoolean()
    @Transform(toBoolean)
    @ApiPropertyOptional({
        description: 'Filter by active state',
        example: true,
        type: Boolean
    })
    isActive?: boolean;

    @IsOptional()
    @IsBoolean()
    @Transform(toBoolean)
    @ApiPropertyOptional({
        description: 'True keeps only the combos that can be assembled right now',
        example: true,
        type: Boolean
    })
    hasStock?: boolean;
}
