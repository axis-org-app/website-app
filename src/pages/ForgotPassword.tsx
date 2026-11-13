import { useState } from "react";
import { useForm } from "react-hook-form";
import { Link } from "react-router-dom";
import AuthLayout from "../components/AuthLayout";
import { TextField } from "../components/TextField";
import { useAuth } from "../context/AuthContext";

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

interface ForgotPasswordFormValues {
  email: string;
}

export default function ForgotPassword() {
  const { requestPasswordReset } = useAuth();
  const [formError, setFormError] = useState("");
  const [requestSent, setRequestSent] = useState(false);
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<ForgotPasswordFormValues>({ defaultValues: { email: "" } });

  async function onSubmit({ email }: ForgotPasswordFormValues) {
    setFormError("");
    setRequestSent(false);
    try {
      await requestPasswordReset(email);
      setRequestSent(true);
    } catch (error) {
      setFormError(error instanceof Error ? error.message : "Something went wrong. Try again.");
    }
  }

  return (
    <AuthLayout
      title="Forgot your password?"
      subtitle="Enter your school email to request a password reset."
      footer={
        <>
          Remembered your password?{" "}
          <Link to="/login" className="font-semibold text-cobalt underline-offset-4 hover:underline">
            Back to school login
          </Link>
        </>
      }
    >
      <form onSubmit={handleSubmit(onSubmit, () => setFormError(""))} noValidate className="space-y-5">
        <p className="rounded-xl border border-sun/70 bg-sun/20 px-4 py-3 text-sm">
          Password recovery is not available in this browser-only demo. Once Supabase Auth is connected, this form
          can send a secure recovery email.
        </p>
        {formError && (
          <div role="alert" className="rounded-xl border border-danger/30 bg-danger/5 px-4 py-3 text-sm font-medium text-danger">
            {formError}
          </div>
        )}
        {requestSent && (
          <p role="status" className="rounded-xl border border-mint/30 bg-mint/10 px-4 py-3 text-sm font-medium">
            If an account exists for this email, a password reset link has been sent.
          </p>
        )}
        <TextField
          label="School email"
          type="email"
          autoComplete="email"
          placeholder="you@yourschool.org"
          {...register("email", {
            required: "Enter your email address.",
            validate: (value) => EMAIL_RE.test(value.trim()) || "Enter a valid email address.",
          })}
          error={errors.email?.message}
        />
        <button
          type="submit"
          disabled={isSubmitting}
          className="h-12 w-full rounded-xl bg-cobalt font-semibold text-white transition-colors hover:bg-cobalt-dark disabled:cursor-not-allowed disabled:opacity-70"
        >
          {isSubmitting ? "Sending…" : "Send reset link"}
        </button>
      </form>
    </AuthLayout>
  );
}
