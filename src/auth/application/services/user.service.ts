import { Inject, Injectable } from '@nestjs/common';
import { BaseErrorException } from '../../../core/domain/exceptions/base.error.exception';
import SymbolsUser from '../../../user/symbols-user';
import { UserModel } from '../../domain/models/user.model';
import { IUserRepository } from '../../domain/repositories/user.interface.repository';
import { IUserService } from '../../domain/services/user.interface.service';

@Injectable()
export class UserService implements IUserService {
  constructor(
    @Inject(SymbolsUser.IUserRepository)
    private readonly userRepository: IUserRepository,
  ) { }

  async findById(id: string): Promise<UserModel> {
    try {
      const foundUser = await this.userRepository.findById(id);

      return foundUser;

    } catch (error) {
      throw new BaseErrorException(error.message, error.statusCode);
    }
  }
}
