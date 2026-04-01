# Co-Research Hub

A collaborative academic research management platform built with React, TypeScript, and Vite.

## Project Structure

- `src/` - Main source code
  - `App.tsx` - Root component with routing and providers
  - `pages/` - Page components (LandingPage, RegisterPage, DashboardPage, TeamPage, ProfilePage, NotFound)
  - `components/` - Reusable UI components (shadcn/ui based)
  - `contexts/` - React contexts (LanguageContext, AppContext)
  - `hooks/` - Custom React hooks
  - `lib/` - Utility functions
  - `data/` - Static data
  - `i18n/` - Internationalization (English + Arabic support)
- `public/` - Static assets
- `index.html` - HTML entry point

## Tech Stack

- **Frontend**: React 18, TypeScript, Vite
- **Routing**: React Router v6
- **UI**: shadcn/ui components, Tailwind CSS, Radix UI primitives
- **State/Data**: TanStack React Query
- **Forms**: React Hook Form + Zod
- **Charts**: Recharts
- **i18n**: Custom LanguageContext with Arabic/English support

## Development

```bash
npm run dev    # Start dev server on port 5000
npm run build  # Build for production
```

## Notes

- Pure frontend app — no backend server
- Migrated from Lovable to Replit: removed `lovable-tagger`, updated Vite config to bind on `0.0.0.0:5000`
- App supports bilingual UI (English and Arabic with RTL)
