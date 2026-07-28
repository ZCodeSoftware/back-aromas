import { ApiPropertyOptional } from "@nestjs/swagger";
import { Type } from "class-transformer";
import { IsDate, IsEnum, IsMongoId, IsNumber, IsOptional, Max, Min } from "class-validator";
import { OrderChannel } from "../../../domain/enum/order-channel.enum";
import { OrderStatus } from "../../../domain/enum/order-status.enum";

export class FilterOrderDTO {
    @IsOptional()
    @IsNumber()
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
        default: 10,
    })
    limit?: number = 10;

    @IsOptional()
    @IsEnum(OrderStatus)
    @ApiPropertyOptional({
        description: 'Filter by order status',
        example: OrderStatus.PENDING,
        enum: OrderStatus,
    })
    status?: OrderStatus;

    @IsOptional()
    @IsDate()
    @Type(() => Date)
    @ApiPropertyOptional({
        description: 'Only orders created on or after this date (ISO 8601)',
        example: '2026-01-01T00:00:00.000Z',
        type: String,
    })
    dateFrom?: Date;

    @IsOptional()
    @IsDate()
    @Type(() => Date)
    @ApiPropertyOptional({
        description: 'Only orders created on or before this date (ISO 8601)',
        example: '2026-12-31T23:59:59.000Z',
        type: String,
    })
    dateTo?: Date;
}

/** Admin-only listing: adds the ability to filter by customer and channel. */
export class FilterAllOrdersDTO extends FilterOrderDTO {
    @IsOptional()
    @IsMongoId()
    @ApiPropertyOptional({
        description: 'Filter by customer ID',
        example: '60c72b2f9b1e8b001c8e4d5d',
        type: String,
    })
    userId?: string;

    @IsOptional()
    @IsEnum(OrderChannel)
    @ApiPropertyOptional({
        description:
            'Filter by sales channel. ONLINE also matches orders created before the channel field existed',
        example: OrderChannel.ONLINE,
        enum: OrderChannel,
    })
    channel?: OrderChannel;
}

/** Point-of-sale listing. The channel is forced by the service, never by the caller. */
export class FilterPosSalesDTO extends FilterOrderDTO {
    @IsOptional()
    @IsMongoId()
    @ApiPropertyOptional({
        description: 'Filter by the operator who registered the sale',
        example: '60c72b2f9b1e8b001c8e4d5d',
        type: String,
    })
    soldBy?: string;
}
