import { SetMetadata } from '@nestjs/common';
import { UserRole } from 'src/user/enums/user-role.enum';

export const ROLES_KEY = 'roles';
export const RolesAllowed = (...roles: UserRole[]) =>
  SetMetadata(ROLES_KEY, roles);
