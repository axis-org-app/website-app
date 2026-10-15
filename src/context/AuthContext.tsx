import { createContext, useContext, useState, type ReactNode } from "react";
import * as api from "../lib/auth";
import type { SchoolAccount, SignUpInput } from "../lib/auth";

interface AuthValue {
  account: SchoolAccount | null;
  signUp: (input: SignUpInput) => Promise<void>;
  logIn: (email: string, password: string, remember: boolean) => Promise<void>;
  logOut: () => void;
}

const AuthContext = createContext<AuthValue | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [account, setAccount] = useState<SchoolAccount | null>(() => api.getSession());

  const value: AuthValue = {
    account,
    signUp: async (input) => setAccount(await api.signUp(input)),
    logIn: async (email, password, remember) => setAccount(await api.logIn(email, password, remember)),
    logOut: () => {
      api.logOut();
      setAccount(null);
    },
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

// eslint-disable-next-line react-refresh/only-export-components
export function useAuth(): AuthValue {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used inside <AuthProvider>");
  return ctx;
}
