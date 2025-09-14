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
  },
  REQUESTS: {
    CREATE: "/api/requests",             // POST
    MINE: "/api/requests",               // GET (τα δικά μου)
    ALL: "/api/requests/all-requests",   // GET (για staff/admin)
    ASSIGN: (id) => `/api/requests/${id}/assign`, // PATCH
    ASSIGNED_TO_ME: "/api/requests/assigned-to-me", // GET
    BY_ID: (id) => `/api/requests/${id}`, // GET | PATCH | DELETE
    STATUS: (id) => `/api/requests/${id}/status`, // PATCH { status }
  },
};
