import { ApiProperty } from "@nestjs/swagger";
import { IsNotEmpty, IsString } from "class-validator";

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
