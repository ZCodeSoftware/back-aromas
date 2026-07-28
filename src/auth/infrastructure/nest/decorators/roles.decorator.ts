import { SetMetadata } from '@nestjs/common';
import { TypeRoles } from '../../../../core/domain/enums/type-roles.enum';

export const ROLES_KEY = 'roles';

/**
 * Declares which roles may reach the handler. Must be combined with
 * `@UseGuards(AuthGuards, RoleGuards)`. When omitted, RoleGuards falls back
 * to requiring ADMIN, which is the behaviour every existing route relies on.
 */
export const Roles = (...roles: TypeRoles[]) => SetMetadata(ROLES_KEY, roles);
