import { PermissionsEnum } from 'src/user/enums/user-permission.enum';

const PERMISSION_HIERARCHY: Record<PermissionsEnum, PermissionsEnum[]> = {
  // CLUSTER_MANAGE
  [PermissionsEnum.CLUSTER_MANAGE]: [PermissionsEnum.CLUSTER_VIEW],

  // OFFICE_PROFILE_MANAGE
  [PermissionsEnum.OFFICE_PROFILE_MANAGE]: [
    PermissionsEnum.OFFICE_PROFILE_VIEW,
  ],

  // PPA_PLAN_MANAGE
  [PermissionsEnum.PPA_PLAN_MANAGE]: [PermissionsEnum.PPA_PLAN_VIEW],

  // PROJECT_MANAGE
  [PermissionsEnum.PROJECT_MANAGE]: [PermissionsEnum.PROJECT_VIEW],

  // SHS_IMMERSION_MANAGE
  [PermissionsEnum.SHS_IMMERSION_MANAGE]: [PermissionsEnum.SHS_IMMERSION_VIEW],

  // SCHOOL_NEED_MANAGE
  [PermissionsEnum.SCHOOL_NEED_MANAGE]: [PermissionsEnum.SCHOOL_NEED_VIEW],

  // SCHOOL_PROFILE_MANAGE
  [PermissionsEnum.SCHOOL_PROFILE_MANAGE]: [
    PermissionsEnum.SCHOOL_PROFILE_VIEW,
  ],

  // USER_MANAGE
  [PermissionsEnum.USER_MANAGE]: [
    PermissionsEnum.USER_VIEW,
    PermissionsEnum.USER_ASSIGN_ROLE,
  ],

  [PermissionsEnum.SCHOOL_PROFILE_VIEW]: [],
  [PermissionsEnum.PROJECT_VIEW]: [],
  [PermissionsEnum.SCHOOL_NEED_VIEW]: [],
  [PermissionsEnum.USER_VIEW]: [],
  [PermissionsEnum.USER_ASSIGN_ROLE]: [],
  [PermissionsEnum.CLUSTER_VIEW]: [],
  [PermissionsEnum.SHS_IMMERSION_VIEW]: [],
  [PermissionsEnum.PPA_PLAN_VIEW]: [],
  [PermissionsEnum.OFFICE_PROFILE_VIEW]: [],
};

export function expandPermissions(perms: PermissionsEnum[]): PermissionsEnum[] {
  const expanded = new Set<PermissionsEnum>(perms);

  const addImplied = (perm: PermissionsEnum) => {
    const implied = PERMISSION_HIERARCHY[perm] || [];
    implied.forEach((p) => {
      if (!expanded.has(p)) {
        expanded.add(p);
        addImplied(p); // Recursive expansion
      }
    });
  };

  perms.forEach(addImplied);
  return Array.from(expanded);
}
