import { ApiProperty } from '@nestjs/swagger';
import { IsEmail, IsNotEmpty, IsString, Matches } from 'class-validator';
import { PASSWORD_REGEX } from '../../../../core/domain/utils/regex/regex.util';

export class LoginBodyDTO {
  @IsEmail()
  @ApiProperty()
  @IsNotEmpty({ message: 'The user email is required' })
  email: string;

  @IsString()
  @ApiProperty()
  @Matches(PASSWORD_REGEX, {
    message:
      'The password must have at least one uppercase letter, one lowercase letter, one number, and one special character',
  })
  @IsNotEmpty({ message: 'The user password is required' })
  password: string;
}
