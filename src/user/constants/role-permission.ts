export const RolePermissions = {
  Stakeholder: ['viewReports', 'requestAccess'],
  SuperAdmin: ['manageUsers', 'configureSystem', 'viewReports'],
  SchoolAdmin: ['manageStudents', 'manageTeachers', 'viewSchoolReports'],
  DivisionAdmin: ['manageSchools', 'assignSchoolAdmins', 'viewDivisionReports'],
} as const;
