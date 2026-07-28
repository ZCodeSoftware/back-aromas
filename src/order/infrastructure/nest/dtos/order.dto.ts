import { ApiProperty, ApiPropertyOptional } from "@nestjs/swagger";
import { Type } from "class-transformer";
import { IsEnum, IsMongoId, IsNotEmpty, IsNumber, IsOptional, Min } from "class-validator";
import { OrderStatus } from "../../../domain/enum/order-status.enum";
import { ShippingType } from "../../../domain/enum/shipping-type.enum";

export class CreateOrderDTO {
    @IsMongoId()
    @IsNotEmpty()
    @ApiProperty({
        description: 'ID of the payment method (cat-payment-method)',
        example: '60c72b2f9b1e8b001c8e4d5d',
        type: String,
        required: true,
        name: 'paymentMethod',
    })
    paymentMethod: string;

    @IsEnum(ShippingType)
    @ApiProperty({
        description: 'How the order is delivered. DELIVERY requires an addressId',
        example: ShippingType.DELIVERY,
        enum: ShippingType,
        required: true,
        name: 'shippingType',
    })
    shippingType: ShippingType;

    @IsOptional()
    @IsMongoId()
    @ApiPropertyOptional({
        description: 'ID of one of the addresses of the authenticated user. Required when shippingType is DELIVERY',
        example: '60c72b2f9b1e8b001c8e4d5e',
        type: String,
        required: false,
        name: 'addressId',
    })
    addressId?: string;

    @IsOptional()
    @IsNumber()
    @Min(0)
    @Type(() => Number)
    @ApiPropertyOptional({
        description: 'Shipping cost added on top of the subtotal. There is no shipping-rate engine yet, so it is taken from the request',
        example: 1500,
        type: Number,
        required: false,
        name: 'shippingPrice',
        minimum: 0,
        default: 0,
    })
    shippingPrice?: number = 0;
}

export class ChangeOrderStatusDTO {
    @IsEnum(OrderStatus)
    @ApiProperty({
        description: 'New status. Allowed moves: PENDING→PAID|CANCELLED, PAID→SHIPPED|CANCELLED, SHIPPED→DELIVERED',
        example: OrderStatus.PAID,
        enum: OrderStatus,
        required: true,
        name: 'status',
    })
    status: OrderStatus;
}
