export const NAV_ITEMS = [
  { key: 'home', label: 'Αρχική', to: '/app', all: true, exact: true },

  { key: 'anonymousRequests', label: 'Τηλεφωνικά Αιτήματα', exact: true, to: '/app/anonymous-requests',
    requireAnyPerm: ['manage_anonymous_requests', 'view_anonymous_requests'], showFor: ['admin', 'therapist', 'social_worker', 'secretary', 'viewer'] },

  { key: 'requests', label: 'Αιτήματα Χρηστών', exact: true, to: '/app/requests',
    requireAnyPerm: ['view_requests'], showFor: ['therapist','social_worker','secretary','admin','viewer'] },

  { key: 'assign', label: 'Αναθέσεις', exact: true, to: '/app/requests/unassigned',
    requireAllPerm: ['assign_requests'], showFor: ['secretary','admin'] },

  { key: 'myRequests', label: 'Τα αιτήματά μου', exact: true, to: '/app/myRequests',
    requireAnyPerm: ['view_own_requests'], showFor: ['patient', 'volunteer', 'secretary'] },

  { key: 'assignedToMe', label: 'Ανατεθειμένα σε εμένα', exact: true, to: '/app/requests/assigned',
    requireAnyPerm: ['view_assigned_requests'], showFor: ['volunteer','therapist','social_worker', 'admin'] },

  { key: 'newRequest', label: 'Νέο αίτημα', exact: true, to: '/app/requests/new',
    requireAnyPerm: ['create_request'], showFor: ['patient', 'volunteer', 'admin'] },


  { key: 'users', label: 'Χρήστες', to: '/app/users', exact: true,
    requireAnyPerm: ['manage_users','update_user','view_patient_info', 'view_user'], showFor: ['admin','secretary','therapist','social_worker','viewer'] },

  { key: 'userCreate', label: 'Δημιουργία χρήστη', to: '/app/users/new', exact: true,
    requireAllPerm: ['manage_users'], showFor: ['admin'] },

  { key: 'profile', label: 'Το προφίλ μου', exact: true, to: '/app/profile', all: true },
];

export const NAV_FOOTER_ITEMS = [
  { key: 'logout', label: 'Αποσύνδεση', to: '/logout', all: true, icon: 'Logout' },
];
