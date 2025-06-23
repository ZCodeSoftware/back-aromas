import { ApiProperty } from "@nestjs/swagger";
import { IsNotEmpty, IsString } from "class-validator";

export class CreatePaymentMethodDTO {
    @IsString()
    @IsNotEmpty()
    @ApiProperty({
        description: 'Payment Method name',
        example: 'Payment Method name',
        required: true,
        type: String,
    })
    name: string
}