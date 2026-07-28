import { createParamDecorator, ExecutionContext, HttpStatus } from '@nestjs/common';
import { BaseErrorException } from '../../../domain/exceptions/base.error.exception';
import { IUserRequest } from '../dtos/custom-request/user.request';

/**
 * Reads the JWT payload attached by AuthGuards. Use `@CurrentUser()` for the
 * whole payload or `@CurrentUser('_id')` for a single field.
 */
export const CurrentUser = createParamDecorator(
    (data: keyof IUserRequest['user'] | undefined, ctx: ExecutionContext) => {
        const request = ctx.switchToHttp().getRequest<IUserRequest>();

        if (!request.user) {
            throw new BaseErrorException('Unauthenticated user', HttpStatus.UNAUTHORIZED);
        }

        return data ? request.user[data] : request.user;
    },
);
