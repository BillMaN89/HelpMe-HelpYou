// // dashboard/cards.js
// export const DASHBOARD_CARDS = [
//   // ---- PATIENT ----
//   {
//     id: 'my-requests',
//     kind: 'metric',                   // 'metric' | 'cta' | 'info'
//     title: 'Δικά μου Αιτήματα',
//     showIf: (auth) => auth.can('view_own_requests'),
//     fetchKey: 'my_open_requests',    
//     fallback: 0,
//   },
//   {
//     id: 'new-request',
//     kind: 'cta',
//     title: 'Νέο Αίτημα',
//     showIf: (auth) => auth.can('create_request'),
//     link: '/requests/new',
//   },

//   // ---- STAFF / VIEWER ----
//   {
//     id: 'open-requests',
//     kind: 'metric',
//     title: 'Ανοιχτά Αιτήματα',
//     showIf: (auth) => auth.can('view_requests'),
//     fetchKey: 'org_open_requests',
//     fallback: 0,
//   },
//   {
//     id: 'assigned-to-me',
//     kind: 'metric',
//     title: 'Ανατεθειμένα σε μένα',
//     showIf: (auth) => auth.can('view_assigned_requests'),
//     fetchKey: 'assigned_to_me_open',
//     fallback: 0,
//   },
//   {
//     id: 'done-this-week',
//     kind: 'metric',
//     title: 'Ολοκληρώθηκαν αυτή την εβδομάδα',
//     showIf: (auth) => auth.can('view_requests'),
//     fetchKey: 'completed_this_week',
//     fallback: 0,
//   },

//   // ---- READ-ONLY USERS  ----
//   {
//     id: 'users-readonly',
//     kind: 'cta',
//     title: 'Χρήστες (ανάγνωση)',
//     showIf: (auth) => auth.can('view_user'),
//     link: '/users',
//   },
// ];
