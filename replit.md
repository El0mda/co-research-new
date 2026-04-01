# Co-Research Hub

A bilingual (Arabic/English) academic research collaboration platform.

## Tech Stack

- **Frontend**: React 18, TypeScript, Vite (port 5000)
- **Backend**: Express.js (port 3001), proxied via Vite `/api/*`
- **Database**: PostgreSQL (via `DATABASE_URL` env var)
- **Routing**: React Router v6
- **UI**: shadcn/ui, Tailwind CSS, Radix UI
- **State**: TanStack React Query, React Context
- **i18n**: Custom LanguageContext — Arabic + English (RTL supported)
- **Auth**: JWT-like token stored in `localStorage` under `co_research_token`

## Project Structure

```
server/
  index.js                 # Express entry point (port 3001)
  db.js                    # PostgreSQL pool
  email.js                 # Email via Resend (gracefully skipped if key missing)
  middleware/auth.js       # Token authentication middleware
  routes/
    auth.js                # /api/auth/* (register, login, verify-email, logout, me, resend-code)
    projects.js            # /api/projects/* (CRUD, join requests, member reorder)
    tasks.js               # /api/projects/:id/tasks
    messages.js            # /api/projects/:id/messages
    users.js               # /api/users/:id

src/
  App.tsx                  # Routing + providers (AuthProvider, LanguageProvider)
  contexts/
    AuthContext.tsx         # Real auth: token + user state, login/logout
    AppContext.tsx          # Thin wrapper kept for compatibility
    LanguageContext.tsx     # AR/EN toggle
  lib/api.ts               # apiGet/apiPost/apiPatch helpers (injects auth token)
  pages/
    LandingPage.tsx
    LoginPage.tsx           # Real login via /api/auth/login
    RegisterPage.tsx        # 4-step wizard → verify email → login
    DashboardPage.tsx       # Live projects from /api/projects
    TeamPage.tsx            # Live tasks, messages, members; drag-drop kanban
    ProfilePage.tsx         # Live user profile from /api/users/:id
    NotFound.tsx
  data/mockData.ts          # Types only — no dummy data
  i18n/                    # ar.json + en.json translation files
```

## Running

```bash
bash start.sh   # starts node server/index.js (port 3001) + vite (port 5000)
```

## Database Tables

`users`, `sessions`, `verification_codes`, `projects`, `project_members`, `tasks`, `messages`, `join_requests`

## Notes

- **Email**: If `RESEND_API_KEY` is not set, email sending is silently skipped but registration still works. Users can be verified by checking the verification code directly in the DB. Connect the Resend integration or set `RESEND_API_KEY` as a secret to enable real email delivery.
- Auth token key in localStorage: `co_research_token`
- All protected routes require `Authorization: Bearer <token>` header
- The Vite dev server proxies `/api/*` to `localhost:3001`
