import { Inject, Injectable } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';

import config from '../../../config';
import SymbolsUser from '../../../user/symbols-user';
import { IUserRepository } from '../../domain/repositories/user.interface.repository';
import { ITokenService } from '../../domain/services/token.interface.service';

@Injectable()
export class TokenService implements ITokenService {
  constructor(
    private readonly jwtService: JwtService,
    @Inject(SymbolsUser.IUserRepository)
    private readonly userRepository: IUserRepository,
  ) { }

  async generateToken(userEmail: string): Promise<string> {
    const user = await this.userRepository.findByEmail(userEmail);
    const { _id, email } = user.toJSON();
    const payload = { _id, email };
    const options = {
      secret: config().app.jwt.secret,
      expiresIn: config().app.jwt.expiresIn,
    };
    const token = await this.jwtService.signAsync(payload, options);
    return token;
  }

  async recoveryToken(userEmail: string): Promise<string> {
    const user = await this.userRepository.findByEmail(userEmail);
    const { _id, email } = user.toJSON();
    const payload = { _id, email };
    const options = {
      secret: config().app.jwt.secret,
      expiresIn: '10m',
    };
    const token = await this.jwtService.signAsync(payload, options);
    return token;
  }
}
