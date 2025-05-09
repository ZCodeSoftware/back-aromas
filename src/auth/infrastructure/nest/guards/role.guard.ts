import {
  CanActivate,
  ExecutionContext,
  HttpStatus,
  Inject,
  Injectable,
} from '@nestjs/common';
import { TypeRoles } from '../../../../core/domain/enums/type-roles.enum';
import { BaseErrorException } from '../../../../core/domain/exceptions/base.error.exception';
import SymbolsUser from '../../../../user/symbols-user';
import { IUserService } from '../../../domain/services/user.interface.service';

@Injectable()
export class RoleGuards implements CanActivate {
  constructor(
    @Inject(SymbolsUser.IUserService)
    private readonly userService: IUserService,
  ) { }
  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest();
    const user = request.user;

    if (!user) {
      throw new BaseErrorException(
        'Unauthenticated user',
        HttpStatus.NOT_FOUND,
      );
    }

    const findRole = await this.userService.findById(user._id);

    const isAdmin = findRole.toJSON().roles.some(r => r.name === TypeRoles.ADMIN);

    if (isAdmin) {
      return true;
    } else {
      throw new BaseErrorException(
        'Access denied: You do not have the required role.',
        HttpStatus.UNAUTHORIZED,
      );
    }
  }
}
