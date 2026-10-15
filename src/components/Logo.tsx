interface LogoProps {
  className?: string;
  tone?: "dark" | "light";
}

export default function Logo({ className = "", tone = "dark" }: LogoProps) {
  return (
    <span className={`inline-flex items-center gap-2.5 ${className}`}>
      <svg width="32" height="32" viewBox="0 0 32 32" aria-hidden="true">
        <rect width="32" height="32" rx="9" fill="#3347ff" />
        <path d="M11 8v13a3 3 0 0 0 3 3h8" fill="none" stroke="#fff" strokeWidth="3.2" strokeLinecap="round" strokeLinejoin="round" />
        <circle cx="21.5" cy="11" r="3" fill="#ffc93c" />
      </svg>
      <span className={`font-display text-2xl font-bold tracking-tight ${tone === "light" ? "text-white" : "text-ink"}`}>
        Learnly
      </span>
    </span>
  );
}
