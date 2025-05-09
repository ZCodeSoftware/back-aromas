import {
  CanActivate,
  ExecutionContext,
  HttpStatus,
  Injectable,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { Request } from 'express';
import config from '../../../../config';
import { BaseErrorException } from '../../../../core/domain/exceptions/base.error.exception';

@Injectable()
export class AuthGuards implements CanActivate {
  constructor(private readonly jwtService: JwtService) { }
  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest();
    const token = this.extractTokenFromHeader(request);
    if (!token) {
      throw new BaseErrorException(
        'Token not found in the request headers',
        HttpStatus.UNAUTHORIZED,
      );
    }
    try {
      const payload = await this.jwtService.verifyAsync(token, {
        secret: config().app.jwt.secret,
      });
      request.user = payload;
    } catch (e) {
      throw new BaseErrorException('Invalid token', HttpStatus.UNAUTHORIZED);
    }
    return true;
  }
  private extractTokenFromHeader(req: Request): string | undefined {
    const [type, token] = req.headers.authorization?.split(' ') ?? [];
    return type === 'Bearer' ? token : undefined;
  }
}
