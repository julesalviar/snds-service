import { PermissionsEnum } from 'src/user/enums/user-permission.enum';

const PERMISSION_HIERARCHY: Record<PermissionsEnum, PermissionsEnum[]> = {
  [PermissionsEnum.PROJECT_MANAGE]: [PermissionsEnum.PROJECT_VIEW],
  [PermissionsEnum.SCHOOL_NEED_MANAGE]: [PermissionsEnum.SCHOOL_NEED_VIEW],
  [PermissionsEnum.USER_MANAGE]: [
    PermissionsEnum.USER_VIEW,
    PermissionsEnum.USER_ASSIGN_ROLE,
  ],
  [PermissionsEnum.SCHOOL_PROFILE_MANAGE]: [
    PermissionsEnum.SCHOOL_PROFILE_VIEW,
  ],
  [PermissionsEnum.CLUSTER_MANAGE]: [PermissionsEnum.CLUSTER_VIEW],
  [PermissionsEnum.SHS_IMMERSION_MANAGE]: [
    PermissionsEnum.SHS_IMMERSION_VIEW,
  ],
  
  [PermissionsEnum.SCHOOL_PROFILE_VIEW]: [],
  [PermissionsEnum.PROJECT_VIEW]: [],
  [PermissionsEnum.SCHOOL_NEED_VIEW]: [],
  [PermissionsEnum.USER_VIEW]: [],
  [PermissionsEnum.USER_ASSIGN_ROLE]: [],
  [PermissionsEnum.CLUSTER_VIEW]: [],
  [PermissionsEnum.SHS_IMMERSION_VIEW]: [],
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
