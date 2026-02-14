export enum UserRole {
  // System level
  SYSTEM = 'system',

  // System Admin
  SYSTEM_ADMIN = 'systemAdmin',

  // Top-Level Roles
  SUPER_ADMIN = 'superAdmin', // Full access to all system-wide resources
  STAKEHOLDER = 'stakeholder',

  // Division Roles
  DIVISION_ADMIN = 'divisionAdmin', // Manages division-wide settings, schools
  DIVISION_STAFF = 'divisionStaff', // Supports division admin, limited actions
  DIVISION_GUEST = 'divisionGuest', // Read-only access to division-level data

  // School Roles
  SCHOOL_ADMIN = 'schoolAdmin', // Manages school-specific content
  SCHOOL_STAFF = 'schoolStaff', // Supports school admin, limited actions
  SCHOOL_GUEST = 'schoolGuest', // Read-only access to school-level data

  // Program Holder Roles
  PROGRAM_HOLDER = 'programHolder',

  // Office Admin Roles
  OFFICE_ADMIN = 'officeAdmin',

  // Global Guests
  GENERAL_GUEST = 'guest', // Minimal access, public data only
}
