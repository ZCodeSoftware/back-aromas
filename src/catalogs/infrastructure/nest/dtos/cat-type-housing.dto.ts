import { ApiProperty } from "@nestjs/swagger";
import { IsNotEmpty, IsString } from "class-validator";

export class CreateTypeHousingDTO {
    @IsString()
    @IsNotEmpty()
    @ApiProperty({
        description: 'Type Housing name',
        example: 'Type Housing name',
        required: true,
        type: String,
    })
    name: string;
}