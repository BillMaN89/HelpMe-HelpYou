export const NAV_ITEMS = [
  { key: 'home', label: 'Αρχική', to: '/app', all: true, exact: true },

  { key: 'requests', label: 'Αιτήματα', exact: true, to: '/app/requests',
    requireAnyPerm: ['view_requests'], showFor: ['therapist','social_worker','secretary','admin'] },

  { key: 'assign', label: 'Αναθέσεις', exact: true, to: '/app/requests/unassigned',
    requireAllPerm: ['assign_requests'], showFor: ['secretary','admin'] },

  { key: 'myRequests', label: 'Τα αιτήματά μου', exact: true, to: '/app/myRequests',
    requireAnyPerm: ['view_own_requests'], showFor: ['patient', 'volunteer'] },

  { key: 'assignedToMe', label: 'Ανατεθειμένα σε μένα', exact: true, to: '/app/requests/assigned',
    requireAnyPerm: ['view_assigned_requests'], showFor: ['volunteer','therapist','social_worker', 'admin'] },

  { key: 'newRequest', label: 'Νέο αίτημα', exact: true, to: '/app/requests/new',
    requireAnyPerm: ['create_request'], showFor: ['patient', 'volunteer', 'admin'] },

  { key: 'users', label: 'Χρήστες', to: '/app/users', exact: true,
    requireAnyPerm: ['manage_users','view_patient_info'], showFor: ['admin','secretary','therapist','social_worker'] },

  { key: 'profile', label: 'Το προφίλ μου', exact: true, to: '/app/profile', all: true },
];

export const NAV_FOOTER_ITEMS = [
  { key: 'logout', label: 'Αποσύνδεση', to: '/logout', all: true, icon: 'Logout' },
];

