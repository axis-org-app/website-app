import type { ReactNode } from "react";
import { Link } from "react-router-dom";
import Logo from "./Logo";

interface AuthLayoutProps {
  title: string;
  subtitle: string;
  children: ReactNode;
  footer: ReactNode;
}

const perks = [
  { title: "Set up in minutes", body: "Register your school and your dashboard is ready straight away." },
  { title: "You approve who joins", body: "Students and teachers request access from the app, and you decide who gets in." },
  { title: "See who's learning", body: "Track which students are active and how they're getting on." },
];

export default function AuthLayout({ title, subtitle, children, footer }: AuthLayoutProps) {
  return (
    <div className="grid min-h-screen lg:grid-cols-[minmax(0,1fr)_minmax(0,0.85fr)]">
      <main className="flex flex-col px-5 py-6 sm:px-12 sm:py-8">
        <Link to="/" aria-label="Learnly home" className="w-fit">
          <Logo />
        </Link>
        <div className="mx-auto flex w-full max-w-md flex-1 flex-col justify-center py-8 sm:py-10">
          <h1 className="font-display text-3xl font-bold tracking-tight sm:text-4xl">{title}</h1>
          <p className="mt-2 text-ink/70">{subtitle}</p>
          <div className="mt-8">{children}</div>
          <p className="mt-8 text-center text-sm text-ink/70">{footer}</p>
        </div>
      </main>

      <aside className="relative hidden overflow-hidden bg-ink p-12 text-white lg:flex lg:flex-col lg:justify-center">
        <div className="absolute -right-24 -top-24 size-72 rounded-full bg-cobalt/40" aria-hidden="true" />
        <div className="absolute -bottom-16 left-10 size-40 rotate-12 rounded-3xl bg-sun" aria-hidden="true" />
        <div className="relative max-w-md">
          <h2 className="font-display text-3xl font-bold leading-snug">
            Run Learnly for your school from one dashboard.
          </h2>
          <ul className="mt-8 space-y-6">
            {perks.map((perk) => (
              <li key={perk.title} className="flex gap-4">
                <svg className="mt-1 size-5 shrink-0 text-sun" viewBox="0 0 20 20" fill="none" aria-hidden="true">
                  <path d="m4 10.5 4 4 8-9" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
                <div>
                  <p className="font-semibold">{perk.title}</p>
                  <p className="mt-0.5 text-white/75">{perk.body}</p>
                </div>
              </li>
            ))}
          </ul>
        </div>
      </aside>
    </div>
  );
}
