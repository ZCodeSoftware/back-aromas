import { ApiProperty } from "@nestjs/swagger";
import { Type } from "class-transformer";
import { IsInt, IsMongoId, IsNotEmpty, Min } from "class-validator";

export class AddCartItemDTO {
    @IsMongoId()
    @IsNotEmpty()
    @ApiProperty({
        description: 'ID of the product to add to the cart',
        example: '60c72b2f9b1e8b001c8e4d5d',
        type: String,
        required: true,
        name: 'productId',
    })
    productId: string;

    @IsInt()
    @Min(1)
    @Type(() => Number)
    @ApiProperty({
        description: 'Units to add. If the product is already in the cart the amount is accumulated',
        example: 2,
        type: Number,
        required: true,
        name: 'quantity',
        minimum: 1,
    })
    quantity: number;
}

export class UpdateCartItemDTO {
    @IsInt()
    @Min(0)
    @Type(() => Number)
    @ApiProperty({
        description: 'New amount of units for the line. Sending 0 removes the product from the cart',
        example: 3,
        type: Number,
        required: true,
        name: 'quantity',
        minimum: 0,
    })
    quantity: number;
}
