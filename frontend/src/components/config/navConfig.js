export const NAV_ITEMS = [
  { key: 'home', label: 'Αρχική', to: '/app', icon: 'Home', all: true },
  { key: 'myRequests', label: 'Τα αιτήματά μου', to: '/requests/mine',
    requireAnyPerm: ['view_own_requests'], showFor: ['patient'] },
  { key: 'newRequest', label: 'Νέο αίτημα', to: '/requests/new',
    requireAnyPerm: ['create_request'], showFor: ['patient'] },
  { key: 'requests', label: 'Αιτήματα', to: '/requests',
    requireAnyPerm: ['view_requests'], showFor: ['therapist','social_worker','secretary','admin'] },
  { key: 'assign', label: 'Αναθέσεις', to: '/requests/unassigned',
    requireAllPerm: ['assign_requests'], showFor: ['secretary','admin'] },
  { key: 'assignedToMe', label: 'Ανατεθειμένα σε μένα', to: '/requests/assigned',
    requireAnyPerm: ['view_assigned_requests'], showFor: ['volunteer','therapist','social_worker'] },
  { key: 'users', label: 'Χρήστες', to: '/users',
    requireAnyPerm: ['manage_users','view_patient_info'], showFor: ['admin','secretary','therapist','social_worker'] },
  { key: 'profile', label: 'Το προφίλ μου', to: '/app/profile', all: true },
];
export const NAV_FOOTER_ITEMS = [
  { key: 'logout', label: 'Αποσύνδεση', to: '/logout', all: true, icon: 'Logout' },
];