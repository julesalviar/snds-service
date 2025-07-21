import { PermissionsEnum } from '../enums/user-permission.enum';
export const RolePermissions = {
  StakeHolder: [PermissionsEnum.VIEW_REPORTS, PermissionsEnum.REQUEST_ACCESS],
  SuperAdmin: [
    PermissionsEnum.MANAGE_USERS,
    PermissionsEnum.CONFIGURE_SYSTEM,
    PermissionsEnum.VIEW_REPORTS,
  ],
  SchoolAdmin: [
    PermissionsEnum.MANAGE_STUDENTS,
    PermissionsEnum.MANAGE_TEACHERS,
    PermissionsEnum.VIEW_SCHOOL_REPORTS,
  ],
  DivisionAdmin: [
    PermissionsEnum.MANAGE_SCHOOLS,
    PermissionsEnum.ASSIGN_SCHOOL_ADMINS,
    PermissionsEnum.VIEW_DIVISION_REPORTS,
  ],
} as const;
