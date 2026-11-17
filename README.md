# Komi Learning

Marketing site plus school registration, login and dashboard for an edtech app.
React 19, TypeScript, Tailwind CSS v4, Vite, React Router.

Students and teachers use the mobile app. Only **schools** register and log in on this website. After logging in,
schools select from the fixed list of offered subjects, approve join requests, manage student and teacher accounts,
assign student classes, and create specific teacher + class + subject assignments with confirmation from the dashboard.

## Run it

```bash
npm install
npm run dev      # http://localhost:5173
npm run build    # type-check and production build
```

## Routes

| Path         | Page                                                              |
| ------------ | ----------------------------------------------------------------- |
| `/`          | Landing page with an interactive quiz demo                        |
| `/signup`    | Register a school                                                 |
| `/login`     | School login                                                      |
| `/forgot-password` | Request a school password reset (requires auth email service) |
| `/dashboard` | School dashboard (redirects to `/login` when signed out)          |

## Connecting a real backend

- Supabase is ready to configure. Copy `.env.example` to `.env.local` and set
  `VITE_SUPABASE_URL` and `VITE_SUPABASE_PUBLISHABLE_KEY` from your Supabase project.
  The client is available from `src/lib/supabase.ts`. Do not put a secret/service-role
  key in this frontend app.
- **Auth** uses Supabase Auth for school signup, login, logout, and session restoration. School details are sent
  as auth user metadata. Password recovery is not set up yet; it needs a recovery route before reset emails are enabled.
- **Dashboard data** is a browser-local demo in `src/lib/schoolData.ts`. It is stored separately for each school in
  localStorage. Replace this store with API calls to synchronize real school, student, and teacher accounts across
  devices. The initial approval requests and student list are sample records.

## Customising

- Brand colours and fonts: `@theme` block in `src/index.css`
- Product name and copy: `src/pages/Home.tsx`, `src/components/Logo.tsx`
