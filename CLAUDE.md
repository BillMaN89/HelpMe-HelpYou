# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

HelpMe-HelpYou is a full-stack web application for non-profit organization management, handling service requests from patients, volunteers, and employees. Built with React + Express + PostgreSQL.

## Development Commands

### Backend (port 5000)
```bash
cd backend
npm install
npm run dev       # Development with nodemon
npm start         # Production
```

### Frontend (Vite dev server)
```bash
cd frontend
npm install
npm run dev       # Development with HMR
npm run build     # Production build
npm run lint      # ESLint
```

### Database Setup
```bash
psql -U postgres -d thesis_db < Thesis_Schema.sql
psql -U postgres -d thesis_db < table_population.sql
```

## Architecture

```
backend/src/
├── index.js              # Express entry point
├── db/pool.js            # PostgreSQL connection pool
├── routes/               # API route definitions
├── controllers/          # Business logic
├── middlewares/          # verifyToken, requirePermission, requireRole
└── utils/helpers.js      # Validation helpers

frontend/src/
├── main.jsx              # React entry with QueryClientProvider
├── App.jsx               # Router configuration
├── pages/                # Page components (dashboard/, requests/, users/)
├── layouts/              # RootLayout (public), AppLayout (authenticated)
├── components/auth/      # AuthContext, Guards (RequireLogin)
├── shared/
│   ├── lib/http.js       # Axios with auth interceptor
│   └── constants/        # API endpoints, status enums, service types
└── hooks/                # Custom React hooks
```

## Key Patterns

### Authentication
- JWT tokens stored in localStorage as `access_token`
- Backend middleware chain: `verifyToken` → `requirePermission`/`requireRole` → handler
- Frontend: `AuthContext` provides `user`, `can(permission)`, `hasRole(role)`, `logout()`

### API
- Base URL: `http://localhost:5000/api`
- All protected routes need `Authorization: Bearer <token>` header
- Axios interceptor in `frontend/src/shared/lib/http.js` handles token injection

### Database
- Raw SQL queries with `pg` driver (no ORM)
- Parameterized queries with `$1, $2` placeholders
- Transactions using `BEGIN`/`COMMIT`/`ROLLBACK` for multi-step operations

### State Management
- TanStack React Query for server state (staleTime: 30s)
- React Context for auth state
- Formik + Yup for form handling and validation

## Roles & Permissions

7 roles: admin, therapist, social_worker, secretary, volunteer, patient, viewer

Key permissions: `view_requests`, `assign_requests`, `manage_users`, `create_request`, `edit_req_status`, `view_assigned_requests`, `view_own_requests`

## Configuration Files

| File | Purpose |
|------|---------|
| `backend/.env` | DATABASE_URL, JWT_SECRET, PORT |
| `frontend/.env` | VITE_API_URL |
| `Thesis_Schema.sql` | Complete PostgreSQL schema |
| `table_population.sql` | Seed data for roles/permissions |

## Interface Language

The UI is in Greek. User-facing text uses Greek strings throughout the frontend.
