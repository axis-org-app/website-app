import { useState } from "react";
import { useForm } from "react-hook-form";
import { Link, Navigate, useNavigate } from "react-router-dom";
import AuthLayout from "../components/AuthLayout";
import { PasswordField, SelectField, TextField } from "../components/TextField";
import { useAuth } from "../context/AuthContext";
import { schoolTypeLabels, type SchoolType } from "../lib/auth";

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

const schoolTypeOptions = (Object.keys(schoolTypeLabels) as SchoolType[]).map((value) => ({
  value,
  label: schoolTypeLabels[value],
}));

function passwordStrength(pw: string): { score: number; label: string } {
  let score = 0;
  if (pw.length >= 8) score++;
  if (/[a-z]/.test(pw) && /[A-Z]/.test(pw)) score++;
  if (/\d/.test(pw)) score++;
  if (/[^A-Za-z0-9]/.test(pw) || pw.length >= 14) score++;
  const labels = ["Too short", "Weak", "Fair", "Good", "Strong"];
  return { score, label: pw ? labels[score] : "" };
}

const meterColors = ["bg-line", "bg-danger", "bg-sun", "bg-mint", "bg-mint-dark"];

interface SignupFormValues {
  schoolName: string;
  schoolType: SchoolType | "";
  firstName: string;
  lastName: string;
  email: string;
  password: string;
  terms: boolean;
}

export default function Signup() {
  const { account, signUp } = useAuth();
  const navigate = useNavigate();
  const [formError, setFormError] = useState("");
  const {
    register,
    handleSubmit,
    watch,
    setError,
    formState: { errors, isSubmitting },
  } = useForm<SignupFormValues>({
    defaultValues: {
      schoolName: "",
      schoolType: "",
      firstName: "",
      lastName: "",
      email: "",
      password: "",
      terms: false,
    },
  });

  if (account) return <Navigate to="/dashboard" replace />;

  const password = watch("password", "");
  const strength = passwordStrength(password);

  async function onSubmit(data: SignupFormValues) {
    setFormError("");
    if (!data.schoolType) {
      setError("schoolType", { type: "required", message: "Choose your school type." });
      return;
    }
    try {
      await signUp({
        schoolName: data.schoolName,
        schoolType: data.schoolType,
        adminName: `${data.firstName.trim()} ${data.lastName.trim()}`,
        email: data.email,
        password: data.password,
      });
      navigate("/dashboard", { replace: true });
    } catch (err) {
      setFormError(err instanceof Error ? err.message : "Something went wrong. Try again.");
    }
  }

  return (
    <AuthLayout
      title="Register your school"
      subtitle="Create your school's account to get your dashboard."
      footer={
        <>
          Already registered?{" "}
          <Link to="/login" className="font-semibold text-cobalt underline-offset-4 hover:underline">
            School login
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
          label="School name"
          autoComplete="organization"
          placeholder="Greenfield Secondary School"
          {...register("schoolName", {
            validate: (value) => value.trim().length >= 2 || "Enter your school's name.",
          })}
          error={errors.schoolName?.message}
        />
        <SelectField
          label="School type"
          placeholder="Choose one"
          options={schoolTypeOptions}
          {...register("schoolType", { required: "Choose your school type." })}
          error={errors.schoolType?.message}
        />
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <TextField
            label="First name"
            autoComplete="given-name"
            placeholder="Ada"
            {...register("firstName", {
              validate: (value) => value.trim().length > 0 || "Enter your first name.",
            })}
            error={errors.firstName?.message}
          />
          <TextField
            label="Last name"
            autoComplete="family-name"
            placeholder="Okafor"
            {...register("lastName", {
              validate: (value) => value.trim().length > 0 || "Enter your last name.",
            })}
            error={errors.lastName?.message}
          />
        </div>
        <TextField
          label="School email"
          type="email"
          autoComplete="email"
          placeholder="you@yourschool.org"
          {...register("email", {
            validate: (value) =>
              EMAIL_RE.test(value.trim()) || "Enter a valid email address, like you@yourschool.org.",
          })}
          error={errors.email?.message}
        />
        <div>
          <PasswordField
            label="Password"
            autoComplete="new-password"
            placeholder="At least 8 characters"
            {...register("password", {
              validate: (value) => value.length >= 8 || "Use at least 8 characters.",
            })}
            error={errors.password?.message}
          />
          {password && (
            <div className="mt-2 flex items-center gap-3" aria-live="polite">
              <div className="flex flex-1 gap-1" aria-hidden="true">
                {[1, 2, 3, 4].map((i) => (
                  <span
                    key={i}
                    className={`h-1.5 flex-1 rounded-full transition-colors ${
                      i <= strength.score ? meterColors[strength.score] : "bg-line"
                    }`}
                  />
                ))}
              </div>
              <span className="w-16 text-right text-sm font-medium text-ink/70">{strength.label}</span>
            </div>
          )}
        </div>

        <div>
          <label className="flex cursor-pointer items-start gap-3 text-sm">
            <input
              type="checkbox"
              {...register("terms", {
                validate: (checked) => checked || "Agree to the terms to register your school.",
              })}
              aria-invalid={errors.terms ? true : undefined}
              className="mt-0.5 size-5 shrink-0 rounded border-line accent-cobalt"
            />
            <span>I agree to Komi Learning's terms of use and privacy policy on behalf of my school.</span>
          </label>
          {errors.terms?.message && <p className="mt-1.5 text-sm font-medium text-danger">{errors.terms.message}</p>}
        </div>

        <button
          type="submit"
          disabled={isSubmitting}
          className="h-12 w-full rounded-xl bg-cobalt font-semibold text-white transition-colors hover:bg-cobalt-dark disabled:cursor-not-allowed disabled:opacity-70"
        >
          {isSubmitting ? "Registering…" : "Register school"}
        </button>
        <p className="rounded-xl bg-ink/5 px-4 py-3 text-sm text-ink/80">
          Students and teachers don't register here. They join from the Komi app, and you approve them from your
          dashboard.
        </p>
      </form>
    </AuthLayout>
  );
}
