/**
 * MOCK AUTH LAYER (schools only)
 * -------------------------------
 * Only schools register and log in on the website. Students and teachers join
 * through the mobile app and are approved from the school dashboard.
 *
 * School accounts live in this browser's localStorage so the signup/login flow
 * works end to end with no backend. Replace the bodies of signUp / logIn /
 * logOut / getSession with calls to your real API (and use httpOnly cookies for
 * the session) before shipping. Passwords are SHA-256 hashed here only so the
 * demo can reject a wrong password; this is NOT secure storage.
 */

export type SchoolType = "primary" | "secondary" | "tertiary" | "other";

export const schoolTypeLabels: Record<SchoolType, string> = {
  primary: "Primary school",
  secondary: "Secondary school",
  tertiary: "College or university",
  other: "Other",
};

export interface SchoolAccount {
  schoolName: string;
  schoolType: SchoolType;
  adminName: string;
  email: string;
}

export interface SignUpInput extends SchoolAccount {
  password: string;
}

interface StoredAccount extends SchoolAccount {
  passwordHash: string;
}

export class AuthError extends Error {}

const ACCOUNTS_KEY = "learnly.schools";
const SESSION_KEY = "learnly.school-session";

async function hash(value: string): Promise<string> {
  const digest = await crypto.subtle.digest("SHA-256", new TextEncoder().encode(value));
  return Array.from(new Uint8Array(digest))
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("");
}

function readAccounts(): StoredAccount[] {
  try {
    return JSON.parse(localStorage.getItem(ACCOUNTS_KEY) ?? "[]") as StoredAccount[];
  } catch {
    return [];
  }
}

const wait = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

function publicAccount({ schoolName, schoolType, adminName, email }: StoredAccount): SchoolAccount {
  return { schoolName, schoolType, adminName, email };
}

function saveSession(account: SchoolAccount, remember: boolean) {
  const target = remember ? localStorage : sessionStorage;
  target.setItem(SESSION_KEY, JSON.stringify(account));
}

export async function signUp(input: SignUpInput): Promise<SchoolAccount> {
  await wait(600); // simulate network latency
  const email = input.email.trim().toLowerCase();
  const accounts = readAccounts();
  if (accounts.some((a) => a.email === email)) {
    throw new AuthError("A school account with this email already exists. Log in instead.");
  }
  const stored: StoredAccount = {
    schoolName: input.schoolName.trim(),
    schoolType: input.schoolType,
    adminName: input.adminName.trim(),
    email,
    passwordHash: await hash(input.password),
  };
  localStorage.setItem(ACCOUNTS_KEY, JSON.stringify([...accounts, stored]));
  const account = publicAccount(stored);
  saveSession(account, true);
  return account;
}

export async function logIn(emailInput: string, password: string, remember: boolean): Promise<SchoolAccount> {
  await wait(600);
  const email = emailInput.trim().toLowerCase();
  const found = readAccounts().find((a) => a.email === email);
  if (!found || found.passwordHash !== (await hash(password))) {
    throw new AuthError("That email and password don't match. Check them and try again.");
  }
  const account = publicAccount(found);
  saveSession(account, remember);
  return account;
}

export function getSession(): SchoolAccount | null {
  try {
    const raw = localStorage.getItem(SESSION_KEY) ?? sessionStorage.getItem(SESSION_KEY);
    return raw ? (JSON.parse(raw) as SchoolAccount) : null;
  } catch {
    return null;
  }
}

export function logOut() {
  localStorage.removeItem(SESSION_KEY);
  sessionStorage.removeItem(SESSION_KEY);
}
