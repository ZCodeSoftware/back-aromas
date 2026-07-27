import { ApiProperty } from "@nestjs/swagger";
import { IsNotEmpty, IsString } from "class-validator";

export class CreateGeoDTO {
    @IsString()
    @IsNotEmpty()
    @ApiProperty({
        description: 'Latitude of the geographical location',
        example: '34.0522',
        type: String,
        required: true,
        name: 'lat'
    })
    lat: string;

    @IsString()
    @IsNotEmpty()
    @ApiProperty({
        description: 'Longitude of the geographical location',
        example: '-118.2437',
        type: String,
        required: true,
        name: 'lng'
    })
    lng: string;
}
