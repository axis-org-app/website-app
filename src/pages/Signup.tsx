import { useState, type FormEvent } from "react";
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

type Errors = Partial<Record<"schoolName" | "schoolType" | "adminName" | "email" | "password" | "terms", string>>;

export default function Signup() {
  const { account, signUp } = useAuth();
  const navigate = useNavigate();
  const [schoolName, setSchoolName] = useState("");
  const [schoolType, setSchoolType] = useState<SchoolType | "">("");
  const [adminName, setAdminName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [terms, setTerms] = useState(false);
  const [errors, setErrors] = useState<Errors>({});
  const [formError, setFormError] = useState("");
  const [loading, setLoading] = useState(false);

  if (account) return <Navigate to="/dashboard" replace />;

  const strength = passwordStrength(password);

  async function onSubmit(e: FormEvent) {
    e.preventDefault();
    const next: Errors = {};
    if (schoolName.trim().length < 2) next.schoolName = "Enter your school's name.";
    if (!schoolType) next.schoolType = "Choose your school type.";
    if (adminName.trim().length < 2) next.adminName = "Enter your full name.";
    if (!EMAIL_RE.test(email.trim())) next.email = "Enter a valid email address, like you@yourschool.org.";
    if (password.length < 8) next.password = "Use at least 8 characters.";
    if (!terms) next.terms = "Agree to the terms to register your school.";
    setErrors(next);
    setFormError("");
    if (Object.keys(next).length > 0 || !schoolType) return;

    setLoading(true);
    try {
      await signUp({ schoolName, schoolType, adminName, email, password });
      navigate("/dashboard", { replace: true });
    } catch (err) {
      setFormError(err instanceof Error ? err.message : "Something went wrong. Try again.");
      setLoading(false);
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
      <form onSubmit={onSubmit} noValidate className="space-y-5">
        {formError && (
          <div role="alert" className="rounded-xl border border-danger/30 bg-danger/5 px-4 py-3 text-sm font-medium text-danger">
            {formError}
          </div>
        )}

        <TextField
          label="School name"
          name="schoolName"
          autoComplete="organization"
          placeholder="Greenfield Secondary School"
          value={schoolName}
          onChange={(e) => setSchoolName(e.target.value)}
          error={errors.schoolName}
        />
        <SelectField
          label="School type"
          name="schoolType"
          placeholder="Choose one"
          options={schoolTypeOptions}
          value={schoolType}
          onChange={(e) => setSchoolType(e.target.value as SchoolType | "")}
          error={errors.schoolType}
        />
        <TextField
          label="Your full name"
          name="adminName"
          autoComplete="name"
          placeholder="Ada Okafor"
          value={adminName}
          onChange={(e) => setAdminName(e.target.value)}
          error={errors.adminName}
        />
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
        <div>
          <PasswordField
            label="Password"
            name="password"
            autoComplete="new-password"
            placeholder="At least 8 characters"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            error={errors.password}
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
              checked={terms}
              onChange={(e) => setTerms(e.target.checked)}
              aria-invalid={errors.terms ? true : undefined}
              className="mt-0.5 size-5 shrink-0 rounded border-line accent-cobalt"
            />
            <span>I agree to Learnly's terms of use and privacy policy on behalf of my school.</span>
          </label>
          {errors.terms && <p className="mt-1.5 text-sm font-medium text-danger">{errors.terms}</p>}
        </div>

        <button
          type="submit"
          disabled={loading}
          className="h-12 w-full rounded-xl bg-cobalt font-semibold text-white transition-colors hover:bg-cobalt-dark disabled:cursor-not-allowed disabled:opacity-70"
        >
          {loading ? "Registering…" : "Register school"}
        </button>
        <p className="rounded-xl bg-ink/5 px-4 py-3 text-sm text-ink/80">
          Students and teachers don't register here. They join from the Learnly app, and you approve them from your
          dashboard.
        </p>
      </form>
    </AuthLayout>
  );
}
