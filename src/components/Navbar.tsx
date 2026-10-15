import { useState } from "react";
import { Link } from "react-router-dom";
import Logo from "./Logo";
import { useAuth } from "../context/AuthContext";

const links = [
  { href: "/#how", label: "How it works" },
  { href: "/#features", label: "Features" },
  { href: "/#schools", label: "For schools" },
  { href: "/#app", label: "In the app" },
];

export default function Navbar() {
  const { account } = useAuth();
  const [open, setOpen] = useState(false);
  const close = () => setOpen(false);

  const primaryBtn =
    "rounded-xl bg-cobalt px-4 py-2.5 text-center text-sm font-semibold text-white hover:bg-cobalt-dark";
  const ghostBtn = "rounded-xl px-4 py-2.5 text-center text-sm font-semibold hover:bg-ink/5";

  return (
    <header className="sticky top-0 z-30 border-b border-line bg-paper/95 backdrop-blur">
      <div className="mx-auto flex max-w-6xl items-center justify-between px-5 py-3.5 sm:px-6">
        <Link to="/" aria-label="Learnly home" onClick={close}>
          <Logo />
        </Link>

        <nav aria-label="Main" className="hidden items-center gap-8 text-sm font-semibold lg:flex">
          {links.map((l) => (
            <a key={l.href} href={l.href} className="text-ink/75 hover:text-ink">
              {l.label}
            </a>
          ))}
        </nav>

        <div className="hidden items-center gap-2 lg:flex">
          {account ? (
            <Link to="/dashboard" className={primaryBtn}>
              Go to dashboard
            </Link>
          ) : (
            <>
              <Link to="/login" className={ghostBtn}>
                School login
              </Link>
              <Link to="/signup" className={primaryBtn}>
                Register your school
              </Link>
            </>
          )}
        </div>

        <button
          type="button"
          onClick={() => setOpen((o) => !o)}
          aria-expanded={open}
          aria-controls="mobile-menu"
          aria-label={open ? "Close menu" : "Open menu"}
          className="-mr-2 rounded-xl p-2 hover:bg-ink/5 lg:hidden"
        >
          <svg className="size-6" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" aria-hidden="true">
            {open ? <path d="M6 6l12 12M18 6L6 18" /> : <path d="M4 7h16M4 12h16M4 17h16" />}
          </svg>
        </button>
      </div>

      {open && (
        <div id="mobile-menu" className="border-t border-line bg-paper lg:hidden">
          <nav aria-label="Mobile" className="mx-auto flex max-w-6xl flex-col px-5 py-3 sm:px-6">
            {links.map((l) => (
              <a
                key={l.href}
                href={l.href}
                onClick={close}
                className="border-b border-line py-3.5 font-semibold text-ink/85 last:border-b-0"
              >
                {l.label}
              </a>
            ))}
            <div className="mt-3 flex flex-col gap-2 pb-3 sm:flex-row">
              {account ? (
                <Link to="/dashboard" onClick={close} className={`${primaryBtn} sm:flex-1`}>
                  Go to dashboard
                </Link>
              ) : (
                <>
                  <Link to="/login" onClick={close} className={`${ghostBtn} border border-line sm:flex-1`}>
                    School login
                  </Link>
                  <Link to="/signup" onClick={close} className={`${primaryBtn} sm:flex-1`}>
                    Register your school
                  </Link>
                </>
              )}
            </div>
          </nav>
        </div>
      )}
    </header>
  );
}
