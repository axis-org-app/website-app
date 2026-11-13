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
  schoolCode: string;
}

export interface SignUpInput extends Omit<SchoolAccount, "schoolCode"> {
  password: string;
}

interface StoredAccount extends SchoolAccount {
  passwordHash: string;
}

export class AuthError extends Error {}

const ACCOUNTS_KEY = "komi.schools";
const SESSION_KEY = "komi.school-session";
const SCHOOL_CODE_ALPHABET = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";

async function hash(value: string): Promise<string> {
  const digest = await crypto.subtle.digest("SHA-256", new TextEncoder().encode(value));
  return Array.from(new Uint8Array(digest))
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("");
}

function readAccounts(): StoredAccount[] {
  try {
    const storedAccounts = JSON.parse(localStorage.getItem(ACCOUNTS_KEY) ?? "[]") as Array<
      Omit<StoredAccount, "schoolCode"> & { schoolCode?: string }
    >;
    const usedCodes = new Set<string>();
    let needsSave = false;
    const accounts = storedAccounts.map((account) => {
      let schoolCode = account.schoolCode;
      if (!schoolCode || usedCodes.has(schoolCode)) {
        schoolCode = createSchoolCode(usedCodes);
        needsSave = true;
      }
      usedCodes.add(schoolCode);
      return { ...account, schoolCode };
    });
    if (needsSave) localStorage.setItem(ACCOUNTS_KEY, JSON.stringify(accounts));
    return accounts;
  } catch {
    return [];
  }
}

const wait = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

function createSchoolCode(existingCodes: ReadonlySet<string>): string {
  let code: string;
  do {
    const bytes = crypto.getRandomValues(new Uint8Array(8));
    code = `KOMI-${Array.from(bytes, (byte) => SCHOOL_CODE_ALPHABET[byte % SCHOOL_CODE_ALPHABET.length]).join("")}`;
  } while (existingCodes.has(code));
  return code;
}

function publicAccount(account: StoredAccount): SchoolAccount {
  return {
    schoolName: account.schoolName,
    schoolType: account.schoolType,
    adminName: account.adminName,
    email: account.email,
    schoolCode: account.schoolCode,
  };
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
    schoolCode: createSchoolCode(new Set(accounts.map((account) => account.schoolCode))),
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

export async function requestPasswordReset(_email: string): Promise<void> {
  throw new AuthError(
    "Password recovery is not available in this browser-only demo yet. Connect Supabase Auth to send a secure recovery email.",
  );
}

export function getSession(): SchoolAccount | null {
  try {
    const raw = localStorage.getItem(SESSION_KEY) ?? sessionStorage.getItem(SESSION_KEY);
    if (!raw) return null;
    const session = JSON.parse(raw) as Pick<SchoolAccount, "email">;
    const account = readAccounts().find((storedAccount) => storedAccount.email === session.email);
    return account ? publicAccount(account) : null;
  } catch {
    return null;
  }
}

export function logOut() {
  localStorage.removeItem(SESSION_KEY);
  sessionStorage.removeItem(SESSION_KEY);
}
