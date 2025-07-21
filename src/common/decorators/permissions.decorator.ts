import { SetMetadata } from '@nestjs/common';
import { PermissionsEnum } from 'src/user/enums/user-permission.enum';

export const PERMISSIONS_KEY = 'permissions';
export const PermissionsAllowed = (...permissions: PermissionsEnum[]) =>
  SetMetadata(PERMISSIONS_KEY, permissions);
