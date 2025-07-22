import {
  CanActivate,
  ExecutionContext,
  Injectable,
  ForbiddenException,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { PERMISSIONS_KEY } from '../decorators/permissions.decorator';
import { PermissionsEnum } from 'src/user/enums/user-permission.enum';
import { expandPermissions } from 'src/common/guards/permission-hierarchy';

@Injectable()
export class PermissionsGuard implements CanActivate {
  constructor(private readonly reflector: Reflector) {}

  canActivate(context: ExecutionContext): boolean {
    const { user } = context.switchToHttp().getRequest();
    if (!user) throw new ForbiddenException('User not found in request');

    const requiredPermissions = this.reflector.getAllAndOverride<
      PermissionsEnum[]
    >(PERMISSIONS_KEY, [context.getHandler(), context.getClass()]);

    const expandedPerms = expandPermissions(user.perms ?? []);
    const hasPermissions =
      !requiredPermissions ||
      requiredPermissions.every((perm) => expandedPerms.includes(perm));

    if (requiredPermissions && !hasPermissions) {
      throw new ForbiddenException('Access denied: permission not satisfied');
    }

    return true;
  }
}
