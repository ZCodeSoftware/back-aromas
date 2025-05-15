import { ApiProperty } from "@nestjs/swagger";
import { IsNotEmpty, IsString } from "class-validator";

export class CreateAssociatedEmotionDTO {
    @IsString()
    @IsNotEmpty()
    @ApiProperty({
        description: 'Associated Emotion name',
        example: 'Associated Emotion Name',
        required: true,
        type: String,
    })
    name: string;
}