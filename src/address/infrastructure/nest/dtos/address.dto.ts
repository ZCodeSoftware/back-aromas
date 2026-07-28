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
    @IsNotEmpty()
    @MaxLength(200)
    @ApiProperty({
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
        description: 'Street number of the address',
        example: 123,
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

    /**
     * Soft-delete flag. Optional because the schema defaults it to true; it stays
     * on the DTO rather than being dropped so clients that already send it keep
     * working under the global `forbidNonWhitelisted` pipe.
     */
    @IsOptional()
    @IsBoolean()
    @ApiPropertyOptional({
        description: 'Whether the address is active. Defaults to true; send false to soft-delete it',
        example: true,
        type: Boolean,
        default: true
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