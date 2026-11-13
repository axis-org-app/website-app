import komiLogo from "../assets/komi_logo.jpg";

interface LogoProps {
  className?: string;
  tone?: "dark" | "light";
}

export default function Logo({ className = "", tone = "dark" }: LogoProps) {
  return (
    <span className={`inline-flex items-center gap-2.5 ${className}`}>
      <img src={komiLogo} alt="" className="h-9 w-9 object-cover rounded-[10px]" />
      <span className={`font-display text-2xl font-bold tracking-tight ${tone === "light" ? "text-white" : "text-ink"}`}>
        Komi
      </span>
    </span>
  );
}
