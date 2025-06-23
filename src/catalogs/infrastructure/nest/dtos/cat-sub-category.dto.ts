import { ApiProperty } from "@nestjs/swagger";
import { IsNotEmpty, IsString } from "class-validator";


export class CreateSubCategoryDTO {
    @IsString()
    @IsNotEmpty()
    @ApiProperty({
        description:'Sub Category Name',
        example: 'Sub Category Name',
        required:true,
        type: String
    })
    name:string;
}