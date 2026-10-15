# Learnly

Marketing site plus school registration, login and dashboard for an edtech app.
React 19, TypeScript, Tailwind CSS v4, Vite, React Router.

Students and teachers use the mobile app. Only **schools** register and log in on this website, and use the dashboard
to see active students and approve students and teachers who request to join from the app.

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
| `/dashboard` | School dashboard (redirects to `/login` when signed out)          |

## Connecting a real backend

- **Auth** is mocked in `src/lib/auth.ts` using localStorage. Replace `signUp`, `logIn`, `logOut` and `getSession`
  with calls to your API (prefer httpOnly cookie sessions). The UI and `AuthContext` do not need to change.
- **Dashboard data** (approval requests, active students, stats) is sample data at the top of
  `src/pages/Dashboard.tsx`. Replace it with API calls, and send approve/decline decisions to your server in
  the `resolve` function.

## Customising

- Brand colours and fonts: `@theme` block in `src/index.css`
- Product name and copy: `src/pages/Home.tsx`, `src/components/Logo.tsx`
