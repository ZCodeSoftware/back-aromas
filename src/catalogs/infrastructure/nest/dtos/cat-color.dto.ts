import { ApiProperty } from "@nestjs/swagger";
import { IsNotEmpty, IsString } from "class-validator";

export class CreateColorDTO {
    @IsString()
    @IsNotEmpty()
    @ApiProperty({
        description: 'Color name',
        example: 'Color Name',
        required: true,
        type: String,
    })
    name: string;


    @IsString()
    @IsNotEmpty()
    @ApiProperty({
        description: 'Color hexadecimal',
        example: 'Color hexadecimal',
        required: true,
        type: String,
    })
    hex: string;
}
