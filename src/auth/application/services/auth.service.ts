import { HttpStatus, Inject, Injectable } from '@nestjs/common';
import { BaseErrorException } from '../../../core/domain/exceptions/base.error.exception';
import { comparePassword } from '../../../core/domain/utils/bcrypt.util';
import SymbolsUser from '../../../user/symbols-user';
import { IUserRepository } from '../../../core/domain/repositories/user.interface.repository';
import { IAuthService } from '../../domain/services/auth.interface.service';
import { ITokenService } from '../../domain/services/token.interface.service';
import { ILogIn } from '../../domain/types/auth.type';
import { IAuthResponse } from '../../domain/types/response-auth.type';
import SymbolsAuth from '../../symbols-auth';

@Injectable()
export class AuthService implements IAuthService {
  constructor(
    @Inject(SymbolsUser.IUserRepository)
    private readonly userRepository: IUserRepository,
    @Inject(SymbolsAuth.ITokenService)
    private readonly tokenService: ITokenService,
  ) { }

  async logIn(body: ILogIn): Promise<IAuthResponse> {
    const user = await this.userRepository.findByEmail(body.email);

    if (!user) {
      throw new BaseErrorException('Invalid credentials', HttpStatus.BAD_REQUEST);
    }

    const checkPassword = await comparePassword(body.password, user);

    if (!checkPassword) {
      throw new BaseErrorException('Invalid credentials', HttpStatus.BAD_REQUEST);
    }

    // A soft-deleted user keeps their row (and their email stays taken) but must
    // not be able to log back in.
    if (user.toJSON().isActive === false) {
      throw new BaseErrorException('Invalid credentials', HttpStatus.BAD_REQUEST);
    }

    const token = await this.tokenService.generateToken(user.toJSON().email);

    return { token, ...user.infoAuth };
  }
}
