import { Link } from "react-router-dom";
import Logo from "./Logo";

export default function Footer() {
  return (
    <footer className="border-t border-line bg-white">
      <div className="mx-auto flex max-w-6xl flex-col gap-6 px-5 py-10 sm:px-6 md:flex-row md:items-center md:justify-between">
        <div>
          <Logo />
          <p className="mt-2 text-sm text-ink/70">Quizzes, flashcards and assessments for schools.</p>
        </div>
        <nav aria-label="Footer" className="flex flex-wrap gap-x-6 gap-y-2 text-sm font-semibold">
          <a href="/#how" className="text-ink/75 hover:text-ink">How it works</a>
          <a href="/#features" className="text-ink/75 hover:text-ink">Features</a>
          <a href="/#schools" className="text-ink/75 hover:text-ink">For schools</a>
          <Link to="/login" className="text-ink/75 hover:text-ink">School login</Link>
          <Link to="/signup" className="text-ink/75 hover:text-ink">Register your school</Link>
        </nav>
      </div>
      <p className="border-t border-line px-5 py-4 text-center text-sm text-ink/60">
        © 2026 Learnly. All rights reserved.
      </p>
    </footer>
  );
}
