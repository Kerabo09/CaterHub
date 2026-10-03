# CaterHub

Catering marketplace: React + Vite + Tailwind, with Supabase for login, database and photo storage.
Setup instructions: [docs/SETUP.md](docs/SETUP.md).

```
npm install
npm run dev        # http://localhost:5173
npm run build      # production build into dist/
npm run typecheck
```

## Project structure

```
src/
  main.tsx, App.tsx         app entry and all routes
  assets/                   logo
  components/
    layout/                 Layout, Navbar, Footer
    auth/                   AuthPage (log in, sign up, password reset), AuthShell, IdCapture, content.ts (all auth text + photos)
    common/                 PhotoField, RequireRole
  pages/
    public/                 Home, Browse, Directory, CatererProfile, HowItWorks, Contact, Legal (privacy / terms)
    customer/               MyInquiries
    partner/                Dashboard
  lib/                      api.ts (Supabase calls), AuthContext, supabase client, options, image helpers
  styles/                   base, layout, search, auth, dashboard, legal (imported by index.css)
  types/                    shared TypeScript types
public/images/              optional auth-caterer.jpg / auth-customer.jpg overrides
supabase/migrations/        run in order (see docs/SETUP.md)
supabase/legacy/            scripts no longer needed
docs/                       setup guide
```

## Deployment
`vercel.json` and `firebase.json` stay in the project root because the hosts read them from there.
