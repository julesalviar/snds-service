import {
  CanActivate,
  ExecutionContext,
  Injectable,
  ForbiddenException,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { ROLES_KEY } from '../decorators/roles.decorator';
import { UserRole as UserRoleEnums } from 'src/user/enums/user-role.enum';
import { IS_PUBLIC_KEY } from 'src/common/constants/metadata';

@Injectable()
export class RolesGuard implements CanActivate {
  constructor(private readonly reflector: Reflector) {}

  canActivate(context: ExecutionContext): boolean {
    const isPublic = this.reflector.get<boolean>(
      IS_PUBLIC_KEY,
      context.getHandler(),
    );

    if (isPublic) {
      return true;
    }
    const { user } = context.switchToHttp().getRequest();
    if (!user) {
      console.warn('Access denied: No user in request');
      throw new ForbiddenException('User not found in request');
    }

    const requiredRoles = this.reflector.getAllAndOverride<UserRoleEnums[]>(
      ROLES_KEY,
      [context.getHandler(), context.getClass()],
    );

    const hasRole = !requiredRoles || requiredRoles.includes(user.role);
    if (requiredRoles && !hasRole) {
      throw new ForbiddenException('Access denied: role not satisfied');
    }

    return true;
  }
}
