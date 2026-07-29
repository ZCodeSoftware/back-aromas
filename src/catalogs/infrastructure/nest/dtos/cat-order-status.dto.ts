import { ApiProperty, ApiPropertyOptional } from "@nestjs/swagger";
import { Type } from "class-transformer";
import { IsEnum, IsInt, IsNotEmpty, IsOptional, IsString, Min } from "class-validator";
import { OrderStatus } from "../../../../core/domain/enums/order-status.enum";

export class CreateOrderStatusDTO {
    @IsEnum(OrderStatus)
    @ApiProperty({
        description: 'Stable code of the status. Restricted to the codes the order state machine knows',
        example: OrderStatus.PENDING,
        enum: OrderStatus,
        required: true,
    })
    code: OrderStatus;

    @IsString()
    @IsNotEmpty()
    @ApiProperty({
        description: 'Label shown to the user',
        example: 'Pendiente',
        required: true,
        type: String,
    })
    name: string;

    @IsInt()
    @Min(0)
    @IsOptional()
    @Type(() => Number)
    @ApiPropertyOptional({
        description: 'Position of the status in the lifecycle, used to sort listings',
        example: 1,
        type: Number,
        minimum: 0,
    })
    sortOrder?: number;
}

/** The code is missing on purpose: every order points at the row by id. */
export class UpdateOrderStatusDTO {
    @IsString()
    @IsOptional()
    @ApiPropertyOptional({
        description: 'Label shown to the user',
        example: 'Pendiente de pago',
        type: String,
    })
    name?: string;

    @IsInt()
    @Min(0)
    @IsOptional()
    @Type(() => Number)
    @ApiPropertyOptional({
        description: 'Position of the status in the lifecycle, used to sort listings',
        example: 1,
        type: Number,
        minimum: 0,
    })
    sortOrder?: number;
}
