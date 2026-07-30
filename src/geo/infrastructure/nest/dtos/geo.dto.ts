import { ApiProperty, ApiPropertyOptional } from "@nestjs/swagger";
import { IsBoolean, IsNotEmpty, IsOptional, IsString } from "class-validator";

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

export class UpdateGeoDTO {
    @IsString()
    @IsOptional()
    @ApiPropertyOptional({
        description: 'Latitude of the geographical location',
        example: '34.0522',
        type: String,
    })
    lat?: string;

    @IsString()
    @IsOptional()
    @ApiPropertyOptional({
        description: 'Longitude of the geographical location',
        example: '-118.2437',
        type: String,
    })
    lng?: string;

    @IsBoolean()
    @IsOptional()
    @ApiPropertyOptional({
        description: 'Soft-delete flag. Send false to deactivate, true to restore',
        example: true,
        type: Boolean,
    })
    isActive?: boolean;
}
