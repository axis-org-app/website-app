import { useState, type FormEvent } from "react";
import { Link, Navigate, useNavigate } from "react-router-dom";
import AuthLayout from "../components/AuthLayout";
import { PasswordField, TextField } from "../components/TextField";
import { useAuth } from "../context/AuthContext";

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export default function Login() {
  const { account, logIn } = useAuth();
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [remember, setRemember] = useState(true);
  const [errors, setErrors] = useState<{ email?: string; password?: string }>({});
  const [formError, setFormError] = useState("");
  const [loading, setLoading] = useState(false);

  if (account) return <Navigate to="/dashboard" replace />;

  async function onSubmit(e: FormEvent) {
    e.preventDefault();
    const next: typeof errors = {};
    if (!EMAIL_RE.test(email.trim())) next.email = "Enter a valid email address, like you@yourschool.org.";
    if (!password) next.password = "Enter your password.";
    setErrors(next);
    setFormError("");
    if (Object.keys(next).length > 0) return;

    setLoading(true);
    try {
      await logIn(email, password, remember);
      navigate("/dashboard", { replace: true });
    } catch (err) {
      setFormError(err instanceof Error ? err.message : "Something went wrong. Try again.");
      setLoading(false);
    }
  }

  return (
    <AuthLayout
      title="School login"
      subtitle="Log in to manage your school's students and teachers."
      footer={
        <>
          Is your school new to Learnly?{" "}
          <Link to="/signup" className="font-semibold text-cobalt underline-offset-4 hover:underline">
            Register your school
          </Link>
        </>
      }
    >
      <form onSubmit={onSubmit} noValidate className="space-y-5">
        {formError && (
          <div role="alert" className="rounded-xl border border-danger/30 bg-danger/5 px-4 py-3 text-sm font-medium text-danger">
            {formError}
          </div>
        )}
        <TextField
          label="School email"
          type="email"
          name="email"
          autoComplete="email"
          placeholder="you@yourschool.org"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          error={errors.email}
        />
        <PasswordField
          label="Password"
          name="password"
          autoComplete="current-password"
          placeholder="Your password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          error={errors.password}
        />
        <label className="flex cursor-pointer items-center gap-3 text-sm">
          <input
            type="checkbox"
            checked={remember}
            onChange={(e) => setRemember(e.target.checked)}
            className="size-5 rounded border-line accent-cobalt"
          />
          Keep me logged in on this device
        </label>
        <button
          type="submit"
          disabled={loading}
          className="h-12 w-full rounded-xl bg-cobalt font-semibold text-white transition-colors hover:bg-cobalt-dark disabled:cursor-not-allowed disabled:opacity-70"
        >
          {loading ? "Logging in…" : "Log in"}
        </button>
        <p className="rounded-xl bg-ink/5 px-4 py-3 text-sm text-ink/80">
          This login is for schools. Students and teachers log in through the Learnly app.
        </p>
      </form>
    </AuthLayout>
  );
}
