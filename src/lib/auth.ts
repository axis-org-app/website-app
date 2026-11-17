import type { User } from "@supabase/supabase-js";
import { supabase } from "./supabase";

export type SchoolType = "secondary";

export const schoolTypeLabels: Record<SchoolType, string> = {
  secondary: "Secondary school",
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

export function schoolAccountFromUser(user: User): SchoolAccount | null {
  if (!user.email) return null;

  const metadata = user.user_metadata;
  const schoolType = metadata.schoolType;
  const validSchoolType = isSchoolType(schoolType) ? schoolType : "secondary";

  return {
    schoolName: typeof metadata.schoolName === "string" ? metadata.schoolName : "",
    schoolType: validSchoolType,
    adminName: typeof metadata.adminName === "string" ? metadata.adminName : "",
    email: user.email,
    schoolCode: `KOMI-${user.id.replace(/-/g, "").slice(0, 12).toUpperCase()}`,
  };
}

function isSchoolType(value: unknown): value is SchoolType {
  return value === "secondary";
}

export async function signUp(input: SignUpInput): Promise<SchoolAccount | null> {
  const { data, error } = await supabase.auth.signUp({
    email: input.email.trim().toLowerCase(),
    password: input.password,
    options: {
      data: {
        schoolName: input.schoolName.trim(),
        schoolType: input.schoolType,
        adminName: input.adminName.trim(),
      },
    },
  });

  if (error) throw error;
  if (!data.user) throw new Error("Supabase did not return a user after signup.");
  return data.session ? schoolAccountFromUser(data.user) : null;
}

export async function logIn(emailInput: string, password: string): Promise<SchoolAccount> {
  const { data, error } = await supabase.auth.signInWithPassword({
    email: emailInput.trim().toLowerCase(),
    password,
  });

  if (error) throw error;
  const account = schoolAccountFromUser(data.user);
  if (!account) throw new Error("This account does not have an email address.");
  return account;
}

export async function getSession(): Promise<SchoolAccount | null> {
  const { data, error } = await supabase.auth.getSession();
  if (error) throw error;
  return data.session ? schoolAccountFromUser(data.session.user) : null;
}

export async function logOut(): Promise<void> {
  const { error } = await supabase.auth.signOut();
  if (error) throw error;
}

export async function requestPasswordReset(_email: string): Promise<void> {
  throw new Error("Password recovery is not available yet. The reset-password page has not been set up.");
}
