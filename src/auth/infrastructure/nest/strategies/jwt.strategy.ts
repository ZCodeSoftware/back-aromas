import { Inject, Injectable, UnauthorizedException } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import config from '../../../../config';
import { IUserService } from '../../../../user/domain/services/user.interface.service';
import SymbolsUser from '../../../../user/symbols-user';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(
    @Inject(SymbolsUser.IUserService)
    private readonly userService: IUserService,
  ) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: config().app.jwt.secret,
    });
  }
  async validate(payload: { _id: string; email: string }) {
    const user = await this.userService.findById(payload._id);
    if (!user) {
      throw new Error('Invalid token');
    }
    return { userId: payload._id, email: payload.email };
  }
  handleRequest(err: any, user: any, info: any) {
    if (err || !user) {
      throw err || new UnauthorizedException();
    }
    return user;
  }
}
