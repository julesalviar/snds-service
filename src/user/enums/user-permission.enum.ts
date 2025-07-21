export enum PermissionsEnum {
  // Stakeholder
  VIEW_REPORTS = 'viewReports',
  REQUEST_ACCESS = 'requestAccess',

  // SuperAdmin
  MANAGE_USERS = 'manageUsers',
  CONFIGURE_SYSTEM = 'configureSystem',

  // SchoolAdmin
  MANAGE_STUDENTS = 'manageStudents',
  MANAGE_TEACHERS = 'manageTeachers',
  VIEW_SCHOOL_REPORTS = 'viewSchoolReports',

  // DivisionAdmin
  MANAGE_SCHOOLS = 'manageSchools',
  ASSIGN_SCHOOL_ADMINS = 'assignSchoolAdmins',
  VIEW_DIVISION_REPORTS = 'viewDivisionReports',
}
