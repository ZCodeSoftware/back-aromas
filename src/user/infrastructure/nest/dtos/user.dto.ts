import { ApiProperty } from "@nestjs/swagger";
import { IsEmail, IsNotEmpty, IsString, Matches, MaxLength, MinLength } from "class-validator";
import { EMAIL_REGEX, PASSWORD_REGEX } from "../../../../core/domain/utils/regex/regex.util";

export class CreateUserDTO {
    @IsString()
    @IsNotEmpty()
    @MinLength(8, {
        message: 'Password must be at least $constraint1 characters long'
    })
    @MaxLength(20, {
        message: 'Password cannot exceed $constraint1 characters'
    })
    @Matches(
        PASSWORD_REGEX,
        {
            message: 'Password must be between 8 and 20 characters long, contain at least one uppercase letter, one lowercase letter, one number, and one special character.',
        },
    )
    @ApiProperty({
        description: 'User password',
        example: 'password123@',
        required: true,
        type: String,
        minLength: 8,
        maxLength: 20,
        pattern: '^(?=.*[a-z])(?=.*[A-Z])(?=.*[0-9])(?=.*[@$!%*?&])[A-Za-z0-9@$!%*?&]{8,20}$',
    })
    password: string;

    @IsEmail()
    @IsNotEmpty()
    @ApiProperty({
        description: 'User email',
        example: "example@test.com",
        required: true,
        pattern: '^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\\.[a-zA-Z]{2,}$',
        type: String,
    })
    @Matches(
        EMAIL_REGEX,
        {
            message: 'Email must be a valid email address.',
        },
    )
    email: string;
}
