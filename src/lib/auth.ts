import type { User } from "@supabase/supabase-js";
import { supabase } from "./supabase";

export type SchoolType = "Secondary" | "Primary" | "College_or_University" | "other";

export const schoolTypeLabels: Record<SchoolType, string> = {
  Secondary: "Secondary school",
  Primary: "Primary school",
  College_or_University: "College or university",
  other: "Other",
};

export interface SchoolAccount {
  schoolName: string;
  schoolType: SchoolType;
  adminName: string;
  email: string;
  schoolCode: string;
}

export interface SignUpInput extends Omit<SchoolAccount, "schoolCode"> {
  password: string;
}

interface PendingSchoolCreation {
  userId: string;
  sch_name: string;
  sch_type: SchoolType;
}

const PENDING_SCHOOL_CREATION_KEY = "komi.pending-school-creation";
const SCHOOL_DETAILS_KEY_PREFIX = "komi.school-details.";
let schoolCreationRequest: Promise<void> | null = null;

function readSchoolDetails(userId: string): { sch_name?: unknown; sch_type?: unknown } {
  const key = `${SCHOOL_DETAILS_KEY_PREFIX}${userId}`;
  const savedDetails = localStorage.getItem(key);
  if (!savedDetails) return {};

  try {
    const details: unknown = JSON.parse(savedDetails);
    if (typeof details === "object" && details !== null) {
      return details;
    }
  } catch {
    // Discard malformed local data and keep loading the authenticated account.
  }

  console.warn("Discarding invalid saved school details.");
  localStorage.removeItem(key);
  return {};
}

export function schoolAccountFromUser(user: User): SchoolAccount | null {
  if (!user.email) return null;

  const metadata = user.user_metadata;
  const schoolDetails = readSchoolDetails(user.id);
  const schoolType = schoolDetails.sch_type ?? metadata.schoolType;
  const normalizedSchoolType = schoolType === "secondary" ? "Secondary" : schoolType;
  const validSchoolType = isSchoolType(normalizedSchoolType) ? normalizedSchoolType : "Secondary";

  return {
    schoolName:
      typeof schoolDetails.sch_name === "string"
        ? schoolDetails.sch_name
        : typeof metadata.schoolName === "string"
          ? metadata.schoolName
          : "",
    schoolType: validSchoolType,
    adminName: typeof metadata.adminName === "string" ? metadata.adminName : "",
    email: user.email,
    schoolCode: `KOMI-${user.id.replace(/-/g, "").slice(0, 12).toUpperCase()}`,
  };
}

function isSchoolType(value: unknown): value is SchoolType {
  return (
    value === "Secondary" ||
    value === "Primary" ||
    value === "College_or_University" ||
    value === "other"
  );
}

function savePendingSchoolCreation(school: PendingSchoolCreation): void {
  localStorage.setItem(PENDING_SCHOOL_CREATION_KEY, JSON.stringify(school));
}

export function submitPendingSchoolCreation(user: User): Promise<void> {
  const savedDetails = localStorage.getItem(PENDING_SCHOOL_CREATION_KEY);
  if (!savedDetails) return Promise.resolve();

  let pending: unknown;
  try {
    pending = JSON.parse(savedDetails);
  } catch {
    console.warn("Discarding invalid pending school registration data.");
    localStorage.removeItem(PENDING_SCHOOL_CREATION_KEY);
    return Promise.resolve();
  }

  if (
    typeof pending !== "object" ||
    pending === null ||
    !("userId" in pending) ||
    typeof pending.userId !== "string"
  ) {
    console.warn("Discarding invalid pending school registration data.");
    localStorage.removeItem(PENDING_SCHOOL_CREATION_KEY);
    return Promise.resolve();
  }
  if (pending.userId !== user.id) return Promise.resolve();
  if (
    !("sch_name" in pending) ||
    typeof pending.sch_name !== "string" ||
    !("sch_type" in pending) ||
    !isSchoolType(pending.sch_type)
  ) {
    console.warn("Discarding invalid pending school registration data.");
    localStorage.removeItem(PENDING_SCHOOL_CREATION_KEY);
    return Promise.resolve();
  }
  if (schoolCreationRequest) return schoolCreationRequest;

  const request = (async () => {
    const { error } = await supabase.rpc("create_school", {
      sch_name: pending.sch_name,
      sch_type: pending.sch_type,
    });
    if (error) throw error;
    localStorage.setItem(
      `${SCHOOL_DETAILS_KEY_PREFIX}${user.id}`,
      JSON.stringify({ sch_name: pending.sch_name, sch_type: pending.sch_type }),
    );
    localStorage.removeItem(PENDING_SCHOOL_CREATION_KEY);
  })();

  schoolCreationRequest = request;
  void request.then(
    () => {
      if (schoolCreationRequest === request) schoolCreationRequest = null;
    },
    () => {
      if (schoolCreationRequest === request) schoolCreationRequest = null;
    },
  );
  return request;
}

export async function signUp(input: SignUpInput): Promise<SchoolAccount | null> {
  const { data, error } = await supabase.auth.signUp({
    email: input.email.trim().toLowerCase(),
    password: input.password,
    options: {
      data: {
        adminName: input.adminName.trim(),
      },
    },
  });

  console.log("Supabase signUp response:", data, error);

  if (error) throw error;
  if (!data.user) throw new Error("Supabase did not return a user after signup.");
  savePendingSchoolCreation({
    userId: data.user.id,
    sch_name: input.schoolName.trim(),
    sch_type: input.schoolType,
  });
  if (data.session) await submitPendingSchoolCreation(data.user);

  return data.session ? schoolAccountFromUser(data.user) : null;
}

export async function verifySignupOtp(emailInput: string, token: string): Promise<SchoolAccount> {
  const { data, error } = await supabase.auth.verifyOtp({
    email: emailInput.trim().toLowerCase(),
    token,
    type: "signup",
  });

  if (error) throw error;
  if (!data.user) throw new Error("Supabase did not return a user after email verification.");

  await submitPendingSchoolCreation(data.user);
  const account = schoolAccountFromUser(data.user);
  if (!account) throw new Error("This account does not have an email address.");
  return account;
}

export async function logIn(emailInput: string, password: string): Promise<SchoolAccount> {
  const { data, error } = await supabase.auth.signInWithPassword({
    email: emailInput.trim().toLowerCase(),
    password,
  });

  console.log("Supabase login response:", data, error);

  if (error) throw error;
  if (!data.user) throw new Error("Supabase did not return a user after login.");

  await submitPendingSchoolCreation(data.user);
  const account = schoolAccountFromUser(data.user);
  if (!account) throw new Error("This account does not have an email address.");
  return account;
}

export async function getSession(): Promise<SchoolAccount | null> {
  const { data, error } = await supabase.auth.getSession();
  if (error) throw error;
  if (!data.session) return null;
  await submitPendingSchoolCreation(data.session.user);
  return schoolAccountFromUser(data.session.user);
}

export async function logOut(): Promise<void> {
  const { error } = await supabase.auth.signOut({ scope: "global" });
  if (error) throw error;
}

export async function requestPasswordReset(_email: string): Promise<void> {
  throw new Error("Password recovery is not available yet. The reset-password page has not been set up.");
}
