import { Body, Controller, Inject, Post } from '@nestjs/common';
import { ApiBody, ApiResponse, ApiTags } from '@nestjs/swagger';
import { IAuthService } from '../../../../auth/domain/services/auth.interface.service';
import SymbolsAuth from '../../../../auth/symbols-auth';
import { LoginBodyDTO } from '../dtos/auth.dto';

@ApiTags('Auth')
@Controller('auth')
export class AuthController {
  constructor(
    @Inject(SymbolsAuth.IAuthService)
    private readonly authService: IAuthService,
  ) {}

  @Post('login')
  @ApiResponse({ status: 201, description: 'Login successful' })
  @ApiResponse({ status: 400, description: 'Invalid request' })
  @ApiBody({ type: LoginBodyDTO })
  async logIn(@Body() body: LoginBodyDTO) {
    return await this.authService.logIn(body);
  }
}
