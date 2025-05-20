import { ApiProperty } from "@nestjs/swagger";
import { IsNotEmpty, IsString } from "class-validator";


export class CreateEssenceDTO {
    @IsString()
    @IsNotEmpty()
    @ApiProperty(
        {
            description: 'Essence name',
            example: 'Essence name',
            required: true,
            type: String,
        }
    )
    name: string;
}