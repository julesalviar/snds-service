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
    PermissionsEnum.CLUSTER_VIEW,
    PermissionsEnum.OFFICE_PROFILE_VIEW,
    PermissionsEnum.PPA_PLAN_VIEW,
    PermissionsEnum.PROJECT_VIEW,
    PermissionsEnum.SCHOOL_NEED_VIEW,
    PermissionsEnum.SCHOOL_PROFILE_VIEW,
    PermissionsEnum.SHS_IMMERSION_VIEW,
    PermissionsEnum.USER_ASSIGN_ROLE,
    PermissionsEnum.USER_MANAGE,
    PermissionsEnum.USER_VIEW,
  ],
  [UserRole.STAKEHOLDER]: [
    PermissionsEnum.CLUSTER_VIEW,
    PermissionsEnum.OFFICE_PROFILE_VIEW,
    PermissionsEnum.PPA_PLAN_VIEW,
    PermissionsEnum.PROJECT_VIEW,
    PermissionsEnum.SCHOOL_NEED_VIEW,
    PermissionsEnum.SCHOOL_PROFILE_VIEW,
    PermissionsEnum.SHS_IMMERSION_VIEW,
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
    PermissionsEnum.SCHOOL_NEED_VIEW,
    PermissionsEnum.USER_ASSIGN_ROLE,
    PermissionsEnum.USER_VIEW,
  ],
  [UserRole.DIVISION_STAFF]: [
    PermissionsEnum.PROJECT_MANAGE,
    PermissionsEnum.SCHOOL_PROFILE_MANAGE,
    PermissionsEnum.SCHOOL_NEED_VIEW,
  ],
  [UserRole.DIVISION_GUEST]: [
    PermissionsEnum.PROJECT_VIEW,
    PermissionsEnum.SCHOOL_NEED_VIEW,
  ],

  // Program holder level
  [UserRole.PROGRAM_HOLDER]: [
    PermissionsEnum.OFFICE_PROFILE_VIEW,
    PermissionsEnum.PPA_PLAN_MANAGE,
  ],

  // Office admin level
  [UserRole.OFFICE_ADMIN]: [
    PermissionsEnum.OFFICE_PROFILE_MANAGE,
    PermissionsEnum.PPA_PLAN_MANAGE,
    PermissionsEnum.USER_ASSIGN_ROLE,
    PermissionsEnum.USER_VIEW,
  ],

  // Global guest
  [UserRole.GENERAL_GUEST]: [PermissionsEnum.SCHOOL_NEED_VIEW],
} as const;
