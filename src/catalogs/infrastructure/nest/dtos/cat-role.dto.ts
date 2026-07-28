import { ApiProperty, ApiPropertyOptional } from "@nestjs/swagger";
import { IsBoolean, IsNotEmpty, IsOptional, IsString } from "class-validator";

export class CreateRoleDTO {
    @IsString()
    @IsNotEmpty()
    @ApiProperty({
        description: 'Role name',
        example: 'Role Name',
        required: true,
        type: String,
    })
    name: string;
}

export class UpdateRoleDTO {
    @IsString()
    @IsOptional()
    @ApiPropertyOptional({
        description: 'Role name',
        example: 'Role Name',
        type: String,
    })
    name?: string;

    @IsBoolean()
    @IsOptional()
    @ApiPropertyOptional({
        description: 'Soft-delete flag. Send false to deactivate, true to restore',
        example: true,
        type: Boolean,
    })
    isActive?: boolean;
}
