import { PermissionsEnum } from 'src/user/enums/user-permission.enum';
import { UserRole } from 'src/user/enums/user-role.enum';
export const RolePermissions = {
  // Top level
  [UserRole.SUPER_ADMIN]: [
    PermissionsEnum.PROJECT_MANAGE,
    PermissionsEnum.SCHOOL_NEED_MANAGE,
    PermissionsEnum.SCHOOL_PROFILE_MANAGE,
    PermissionsEnum.SCHOOL_PROFILE_VIEW,
    PermissionsEnum.USER_MANAGE,
    PermissionsEnum.USER_ASSIGN_ROLE,
  ],
  [UserRole.SYSTEM_ADMIN]: [
    PermissionsEnum.PROJECT_VIEW,
    PermissionsEnum.SCHOOL_NEED_VIEW,
    PermissionsEnum.SCHOOL_PROFILE_VIEW,
  ],
  [UserRole.STAKEHOLDER]: [
    PermissionsEnum.PROJECT_VIEW,
    PermissionsEnum.SCHOOL_NEED_VIEW,
    PermissionsEnum.SCHOOL_PROFILE_VIEW,
  ],

  // School level
  [UserRole.SCHOOL_ADMIN]: [
    PermissionsEnum.PROJECT_MANAGE,
    PermissionsEnum.SCHOOL_NEED_MANAGE,
    PermissionsEnum.SCHOOL_PROFILE_MANAGE,
    PermissionsEnum.SCHOOL_PROFILE_VIEW,
    PermissionsEnum.SHS_IMMERSION_MANAGE,
  ],
  [UserRole.SCHOOL_STAFF]: [
    PermissionsEnum.PROJECT_MANAGE,
    PermissionsEnum.SCHOOL_NEED_MANAGE,
  ],
  [UserRole.SCHOOL_GUEST]: [
    PermissionsEnum.PROJECT_VIEW,
    PermissionsEnum.SCHOOL_NEED_VIEW,
  ],

  // Division level
  [UserRole.DIVISION_ADMIN]: [
    PermissionsEnum.PROJECT_MANAGE,
    PermissionsEnum.SCHOOL_PROFILE_MANAGE,
    PermissionsEnum.SCHOOL_PROFILE_VIEW,
    PermissionsEnum.SCHOOL_NEED_VIEW,
  ],
  [UserRole.DIVISION_STAFF]: [
    PermissionsEnum.PROJECT_MANAGE,
    PermissionsEnum.SCHOOL_PROFILE_MANAGE,
    PermissionsEnum.SCHOOL_PROFILE_VIEW,
    PermissionsEnum.SCHOOL_NEED_VIEW,
  ],
  [UserRole.DIVISION_GUEST]: [
    PermissionsEnum.PROJECT_VIEW,
    PermissionsEnum.SCHOOL_NEED_VIEW,
  ],

  // Global guest
  [UserRole.GENERAL_GUEST]: [PermissionsEnum.SCHOOL_NEED_VIEW],
} as const;
