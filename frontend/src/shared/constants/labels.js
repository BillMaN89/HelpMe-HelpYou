// Human-friendly labels for roles and user types

export const ROLE_LABELS = {
  admin: 'Διαχειριστής',
  secretary: 'Γραμματεία',
  therapist: 'Ψυχολόγος',
  social_worker: 'Κοινωνικός Λειτουργός',
  volunteer: 'Εθελοντής',
  patient: 'Ασθενής',
  viewer: 'Μέλος Διοικητικού',
};

export function roleLabel(role) {
  return ROLE_LABELS[role] ?? role;
}

export const USER_TYPE_LABELS = {
  patient: 'Ασθενής',
  volunteer: 'Εθελοντής',
  employee: 'Υπάλληλος',
};

export function userTypeLabel(userType) {
  return USER_TYPE_LABELS[userType] ?? userType;
}

// Employee type (ENUM employee_type)
export const EMPLOYEE_TYPE_LABELS = {
  full_time: 'Πλήρης Απασχόληση',
  part_time: 'Μερική Απασχόληση',
  intern: 'Πρακτική',
  contractor: 'Συνεργάτης',
  board_member: 'Μέλος Δ.Σ.',
};

export function employeeTypeLabel(t) {
  return EMPLOYEE_TYPE_LABELS[t] ?? t;
}

// Department (ENUM department)
export const DEPARTMENT_LABELS = {
  social_services: 'Κοινωνική Υπηρεσία',
  psychological_services: 'Ψυχολογική Υπηρεσία',
  // Note: administration maps to Secretary (Γραμματεία) in role resolver
  administration: 'Γραμματεία',
  // management is general Management/Administration (Διοίκηση)
  management: 'Διοίκηση',
  board_of_directors: 'Διοικητικό Συμβούλιο',
};

export function departmentLabel(d) {
  return DEPARTMENT_LABELS[d] ?? d;
}

// Options helpers
export const EMPLOYEE_TYPE_OPTIONS = Object.entries(EMPLOYEE_TYPE_LABELS).map(([value, label]) => ({ value, label }));
export const DEPARTMENT_OPTIONS = Object.entries(DEPARTMENT_LABELS).map(([value, label]) => ({ value, label }));
export const USER_TYPE_OPTIONS = Object.entries(USER_TYPE_LABELS).map(([value, label]) => ({ value, label }));
