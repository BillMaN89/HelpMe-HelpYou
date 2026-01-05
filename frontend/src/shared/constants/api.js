export const API = {
  AUTH: {
    REGISTER: "/api/auth/register",
    LOGIN: "/api/auth/login",
  },
  USERS: {
    ME: "/api/users/me", // GET profile, PATCH update
    BY_EMAIL: (email) => `/api/users/${encodeURIComponent(email)}`,
    DELETE:   (email) => `/api/users/${encodeURIComponent(email)}`,
    LIST: "/api/users",
    ROLES_ALL: "/api/users/roles", // GET
    ROLES_SET: (email) => `/api/users/${encodeURIComponent(email)}/roles`, // PATCH { roles: [] }
    EMPLOYEES: "/api/users/employees", // GET (for assignment dropdowns)
  },
  REQUESTS: {
    CREATE: "/api/requests",             // POST
    MINE: "/api/requests",               // GET (τα δικά μου)
    ALL: "/api/requests/all-requests",   // GET (για staff/admin)
    UNASSIGNED: "/api/requests/unassigned", // GET (για ανάθεση)
    ASSIGN: (id) => `/api/requests/${id}/assign`, // PATCH
    ASSIGNED_TO_ME: "/api/requests/assigned-to-me", // GET
    BY_ID: (id) => `/api/requests/${id}`, // GET | PATCH | DELETE
    STATUS: (id) => `/api/requests/${id}/status`, // PATCH { status }
  },
  ANONYMOUS_REQUESTS: {
    CREATE: "/api/anonymous-requests",               // POST
    LIST: "/api/anonymous-requests",                 // GET (paginated)
    BY_ID: (id) => `/api/anonymous-requests/${id}`,  // GET
    ASSIGN: (id) => `/api/anonymous-requests/${id}/assign`, // PATCH
    STATUS: (id) => `/api/anonymous-requests/${id}/status`, // PATCH
    NOTES: (id) => `/api/anonymous-requests/${id}/notes`,   // PATCH
  },
};
