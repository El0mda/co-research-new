# Co-Research Hub

A bilingual (Arabic/English) academic research collaboration platform built with React + Express.js.

## Architecture

- **Frontend**: React 18 + TypeScript + Vite (port 5000)
- **Backend**: Express.js API server (port 3001)
- **Database**: PostgreSQL (Replit built-in, auto-connected via DATABASE_URL)
- **Styling**: Tailwind CSS + shadcn/ui components

## Project Structure

```
/
├── src/                    # React frontend
│   ├── pages/              # Page-level components
│   ├── components/         # Reusable UI components (including shadcn/ui)
│   ├── contexts/           # Auth, Language, AppState contexts
│   ├── assets/             # Images and static files (copied from attached_assets)
│   ├── i18n/               # Arabic/English translations
│   └── lib/api.ts          # API utility for authenticated requests
├── server/                 # Express.js backend
│   ├── index.js            # Entry point (port 3001)
│   ├── db.js               # PostgreSQL pool connection
│   ├── init-db.js          # Database schema initialization script
│   ├── email.js            # Resend email integration
│   ├── routes/             # API route handlers
│   └── middleware/         # Auth middleware
├── public/                 # Static public assets
├── start.sh                # Startup script (init DB → start server → start Vite)
└── vite.config.ts          # Vite config with @assets alias and API proxy
```

## Running the App

The app starts via `bash start.sh` which:
1. Initializes database tables (CREATE TABLE IF NOT EXISTS)
2. Starts the Express API server on port 3001
3. Starts the Vite dev server on port 5000

## Key Configuration

- **Vite aliases**: `@` → `./src`, `@assets` → `./src/assets`
- **API proxy**: Vite proxies `/api/*` to `http://localhost:3001`
- **Database**: Auto-initialized on startup via `server/init-db.js`

## Features

- User registration with 4-step wizard and email verification (Resend)
- JWT-based sessions stored in PostgreSQL
- Research project creation and management
- Kanban task board with drag-and-drop
- Real-time-like team messaging
- Join request workflow with leader approval
- Full RTL support for Arabic
- Bilingual UI (Arabic/English)

## Environment Variables

- `DATABASE_URL` — PostgreSQL connection string (Replit-managed)
- `RESEND_API_KEY` — For sending verification emails (optional, gracefully fails)
- `SESSION_SECRET` — Session signing secret
