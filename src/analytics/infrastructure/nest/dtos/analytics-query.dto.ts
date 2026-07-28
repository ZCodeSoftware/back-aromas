import { ApiPropertyOptional } from "@nestjs/swagger";
import { Type } from "class-transformer";
import { IsEnum, IsInt, IsOptional, IsString, Matches, Max, Min } from "class-validator";
import { GroupBy } from "../../../domain/enum/group-by.enum";
import { DEFAULT_TZ_OFFSET, MAX_RANGE_DAYS } from "../../../domain/utils/date-range.util";

const DAY = /^\d{4}-\d{2}-\d{2}$/;
const TZ = /^[+-]\d{2}:\d{2}$/;

/**
 * Reporting filter, deliberately day-granular where FilterOrderDTO takes ISO
 * instants: "what did I sell today" means a calendar day in the store's timezone,
 * and doing that conversion in one place beats every client doing it again.
 *
 * Note the global ValidationPipe runs with forbidNonWhitelisted, so each endpoint
 * inherits exactly the params it accepts. Do not blanket-forward query strings.
 */
export class AnalyticsRangeDTO {
    @IsOptional()
    @IsString()
    @Matches(DAY, { message: 'dateFrom must be a calendar day in YYYY-MM-DD' })
    @ApiPropertyOptional({
        description: `First day of the range, inclusive, read in \`timezone\`. Defaults to 30 days back. The range cannot exceed ${MAX_RANGE_DAYS} days`,
        example: '2026-07-01',
        type: String,
    })
    dateFrom?: string;

    @IsOptional()
    @IsString()
    @Matches(DAY, { message: 'dateTo must be a calendar day in YYYY-MM-DD' })
    @ApiPropertyOptional({
        description: 'Last day of the range, INCLUSIVE, read in `timezone`. Defaults to today',
        example: '2026-07-28',
        type: String,
    })
    dateTo?: string;

    @IsOptional()
    @IsString()
    @Matches(TZ, { message: 'timezone must be a fixed UTC offset like -03:00' })
    @ApiPropertyOptional({
        description:
            'Fixed UTC offset used to cut calendar days. IANA zone names and daylight saving are not supported',
        example: DEFAULT_TZ_OFFSET,
        type: String,
        default: DEFAULT_TZ_OFFSET,
    })
    timezone?: string;
}

/** The dashboard keeps its all-time behaviour when no dates are sent. */
export class DashboardQueryDTO extends AnalyticsRangeDTO { }

export class SalesTimeSeriesDTO extends AnalyticsRangeDTO {
    @IsOptional()
    @IsEnum(GroupBy)
    @ApiPropertyOptional({
        description: 'Bucket size. Weeks are keyed by their Monday, months by YYYY-MM',
        example: GroupBy.DAY,
        enum: GroupBy,
        default: GroupBy.DAY,
    })
    groupBy?: GroupBy = GroupBy.DAY;
}

export class InventoryQueryDTO extends AnalyticsRangeDTO {
    @IsOptional()
    @IsInt()
    @Min(1)
    @Max(1000)
    @Type(() => Number)
    @ApiPropertyOptional({
        description: 'Units at or below which a product counts as low stock',
        example: 5,
        type: Number,
        minimum: 1,
        maximum: 1000,
        default: 5,
    })
    lowStockThreshold?: number = 5;

    @IsOptional()
    @IsInt()
    @Min(1)
    @Max(100)
    @Type(() => Number)
    @ApiPropertyOptional({
        description: 'How many products each list returns. Totals always cover the full set',
        example: 20,
        type: Number,
        minimum: 1,
        maximum: 100,
        default: 20,
    })
    limit?: number = 20;
}

export class CustomersQueryDTO extends AnalyticsRangeDTO {
    @IsOptional()
    @IsInt()
    @Min(1)
    @Max(50)
    @Type(() => Number)
    @ApiPropertyOptional({
        description: 'Size of the top-customers leaderboard',
        example: 10,
        type: Number,
        minimum: 1,
        maximum: 50,
        default: 10,
    })
    limit?: number = 10;
}

export class ConversionQueryDTO extends AnalyticsRangeDTO {
    @IsOptional()
    @IsInt()
    @Min(1)
    @Max(8760)
    @Type(() => Number)
    @ApiPropertyOptional({
        description: 'Hours without activity after which a cart holding items counts as abandoned',
        example: 24,
        type: Number,
        minimum: 1,
        maximum: 8760,
        default: 24,
    })
    abandonedAfterHours?: number = 24;
}
