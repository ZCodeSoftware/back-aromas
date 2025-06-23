import { ApiProperty } from "@nestjs/swagger";
import { IsNotEmpty, IsString } from "class-validator";



export class CreateBrandDTO {
    @IsString()
    @IsNotEmpty()
    @ApiProperty({
        description: 'Brand name',
        example: 'Brand Name',
        required: true,
        type: String,
    })
    name: string;
}