import {
  CanActivate,
  ExecutionContext,
  HttpStatus,
  Inject,
  Injectable,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { TypeRoles } from '../../../../core/domain/enums/type-roles.enum';
import { BaseErrorException } from '../../../../core/domain/exceptions/base.error.exception';
import { IUserService } from '../../../../user/domain/services/user.interface.service';
import SymbolsUser from '../../../../user/symbols-user';
import { ROLES_KEY } from '../decorators/roles.decorator';

@Injectable()
export class RoleGuards implements CanActivate {
  constructor(
    @Inject(SymbolsUser.IUserService)
    private readonly userService: IUserService,
    private readonly reflector: Reflector,
  ) { }

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest();
    const user = request.user;

    if (!user) {
      throw new BaseErrorException(
        'Unauthenticated user',
        HttpStatus.UNAUTHORIZED,
      );
    }

    // No @Roles() on the route means "admin only", the behaviour every
    // pre-existing route was written against.
    const requiredRoles = this.reflector.getAllAndOverride<TypeRoles[]>(ROLES_KEY, [
      context.getHandler(),
      context.getClass(),
    ]) ?? [TypeRoles.ADMIN];

    if (!requiredRoles.length) return true;

    const foundUser = await this.userService.findById(user._id);
    const userRoles = foundUser.toJSON().roles ?? [];

    const hasRole = userRoles.some((r: { name: string }) =>
      requiredRoles.includes(r.name as TypeRoles),
    );

    if (!hasRole) {
      throw new BaseErrorException(
        'Access denied: You do not have the required role.',
        HttpStatus.FORBIDDEN,
      );
    }

    return true;
  }
}
