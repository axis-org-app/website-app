import { useState } from "react";
import { useForm } from "react-hook-form";
import { Link, Navigate, useNavigate } from "react-router-dom";
import AuthLayout from "../components/AuthLayout";
import { PasswordField, TextField } from "../components/TextField";
import { useAuth } from "../context/AuthContext";

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

interface LoginFormValues {
  email: string;
  password: string;
  remember: boolean;
}

export default function Login() {
  const { account, logIn } = useAuth();
  const navigate = useNavigate();
  const [formError, setFormError] = useState("");
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<LoginFormValues>({
    defaultValues: { email: "", password: "", remember: true },
  });

  if (account) return <Navigate to="/dashboard" replace />;

  async function onSubmit({ email, password, remember }: LoginFormValues) {
    setFormError("");
    try {
      await logIn(email, password, remember);
      navigate("/dashboard", { replace: true });
    } catch (err) {
      setFormError(err instanceof Error ? err.message : "Something went wrong. Try again.");
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
      <form onSubmit={handleSubmit(onSubmit, () => setFormError(""))} noValidate className="space-y-5">
        {formError && (
          <div role="alert" className="rounded-xl border border-danger/30 bg-danger/5 px-4 py-3 text-sm font-medium text-danger">
            {formError}
          </div>
        )}
        <TextField
          label="School email"
          type="email"
          autoComplete="email"
          placeholder="you@yourschool.org"
          {...register("email", {
            required: "Enter your email address.",
            validate: (value) =>
              EMAIL_RE.test(value.trim()) || "Enter a valid email address, like you@yourschool.org.",
          })}
          error={errors.email?.message}
        />
        <PasswordField
          label="Password"
          autoComplete="current-password"
          placeholder="Your password"
          {...register("password", { required: "Enter your password." })}
          error={errors.password?.message}
        />
        <label className="flex cursor-pointer items-center gap-3 text-sm">
          <input
            type="checkbox"
            {...register("remember")}
            className="size-5 rounded border-line accent-cobalt"
          />
          Keep me logged in on this device
        </label>
        <button
          type="submit"
          disabled={isSubmitting}
          className="h-12 w-full rounded-xl bg-cobalt font-semibold text-white transition-colors hover:bg-cobalt-dark disabled:cursor-not-allowed disabled:opacity-70"
        >
          {isSubmitting ? "Logging in…" : "Log in"}
        </button>
        <p className="rounded-xl bg-ink/5 px-4 py-3 text-sm text-ink/80">
          This login is for schools. Students and teachers log in through the Learnly app.
        </p>
      </form>
    </AuthLayout>
  );
}
