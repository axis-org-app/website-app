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

- **Auth** is mocked in `src/lib/auth.ts` using localStorage. Replace `signUp`, `logIn`, `logOut` and `getSession`
  with calls to your API (prefer httpOnly cookie sessions). `requestPasswordReset` is the integration point for
  password recovery. With Supabase Auth, implement it using `supabase.auth.resetPasswordForEmail(email, { redirectTo })`,
  then add a recovery callback route that lets the school set a new password with `supabase.auth.updateUser`.
  The local demo deliberately does not change passwords without verified email ownership.
- **Dashboard data** is a browser-local demo in `src/lib/schoolData.ts`. It is stored separately for each school in
  localStorage. Replace this store with API calls to synchronize real school, student, and teacher accounts across
  devices. The initial approval requests and student list are sample records.

## Customising

- Brand colours and fonts: `@theme` block in `src/index.css`
- Product name and copy: `src/pages/Home.tsx`, `src/components/Logo.tsx`
