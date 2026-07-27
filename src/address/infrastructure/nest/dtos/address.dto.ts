import { ApiProperty, ApiPropertyOptional, PartialType } from "@nestjs/swagger";
import { Type } from "class-transformer";
import { IsBoolean, IsNotEmpty, IsNumber, IsOptional, IsString, MaxLength, ValidateNested } from "class-validator";

export class GeoDTO {
    @IsString()
    @ApiProperty({
        description: 'Latitude of the location',
        example: '40.7128',
        type: String,
        required: true
    })
    lat: string;

    @IsString()
    @ApiProperty({
        description: 'Longitude of the location',
        example: '-74.0060',
        type: String,
        required: true
    })
    lng: string;
}

export class CreateAddressDTO {
    @IsOptional()
    @IsString()
    @MaxLength(100)
    @ApiPropertyOptional({
        description: 'Name of the address',
        example: 'Home',
        type: String,
        maxLength: 100
    })
    name?: string;

    @IsString()
    @MaxLength(200)
    @ApiPropertyOptional({
        description: 'Street of the address',
        example: '123 Main St',
        type: String,
        required: true,
        maxLength: 200
    })
    street: string;

    @IsOptional()
    @IsNumber()
    @ApiPropertyOptional({
        description: 'Number of the address',
        example: 'Apt 4B',
        type: Number,
    })
    number?: number;

    @IsString()
    @IsNotEmpty()
    @MaxLength(20)
    @ApiProperty({
        description: 'Zip code of the address',
        example: '12345',
        type: String,
        required: true,
        maxLength: 20
    })
    zipCode: string;

    @IsOptional()
    @IsString()
    @MaxLength(500)
    @ApiPropertyOptional({
        description: 'Description of the address',
        example: 'Near the central park',
        type: String,
        maxLength: 500
    })
    description?: string;

    @IsOptional()
    @IsString()
    @MaxLength(50)
    @ApiPropertyOptional({
        description: 'Floor address of the building',
        example: '3rd Floor',
        type: String,
        maxLength: 50
    })
    floorAddress?: string;

    @IsBoolean()
    @IsNotEmpty()
    @ApiProperty({
        description: 'Active status of the address',
        example: 'true',
        type: Boolean,
        required: true,
        default: 'true'
    })
    isActive?: boolean;

    @IsOptional()
    @IsString()
    @ApiPropertyOptional({
        description: 'Type of housing associated with the address',
        example: 'Apartment',
        type: String,
        required: false
    })
    typeOfHousing?: string;

    @IsOptional()
    @ValidateNested()
    @Type(() => GeoDTO)
    @ApiPropertyOptional({
        description: 'Geographical location associated with the address',
        type: () => GeoDTO,
        required: false
    })
    geo?: GeoDTO;
}

export class UpdateAddressDTO extends PartialType(CreateAddressDTO) { }