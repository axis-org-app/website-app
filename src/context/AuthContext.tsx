import { createContext, useContext, useEffect, useState, type ReactNode } from "react";
import * as api from "../lib/auth";
import type { SchoolAccount, SignUpInput } from "../lib/auth";
import { supabase } from "../lib/supabase";

interface AuthValue {
  account: SchoolAccount | null;
  isLoading: boolean;
  signUp: (input: SignUpInput) => Promise<boolean>;
  logIn: (email: string, password: string) => Promise<void>;
  requestPasswordReset: (email: string) => Promise<void>;
  logOut: () => Promise<void>;
}

const AuthContext = createContext<AuthValue | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [account, setAccount] = useState<SchoolAccount | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [authError, setAuthError] = useState("");

  useEffect(() => {
    let active = true;
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      if (active) setAccount(session ? api.schoolAccountFromUser(session.user) : null);
    });

    api
      .getSession()
      .then((session) => {
        if (active) setAccount(session);
      })
      .catch((error: unknown) => {
        if (active) setAuthError(error instanceof Error ? error.message : "Unable to load your session.");
      })
      .finally(() => {
        if (active) setIsLoading(false);
      });

    return () => {
      active = false;
      subscription.unsubscribe();
    };
  }, []);

  const value: AuthValue = {
    account,
    isLoading,
    signUp: async (input) => {
      const signedInAccount = await api.signUp(input);
      setAccount(signedInAccount);
      return signedInAccount !== null;
    },
    logIn: async (email, password) => setAccount(await api.logIn(email, password)),
    requestPasswordReset: (email) => api.requestPasswordReset(email),
    logOut: async () => {
      await api.logOut();
      setAccount(null);
    },
  };

  if (authError) {
    return (
      <div role="alert" className="m-6 rounded-xl border border-danger/30 bg-danger/5 px-4 py-3 text-sm font-medium text-danger">
        Unable to load your Supabase session: {authError}
      </div>
    );
  }

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

// eslint-disable-next-line react-refresh/only-export-components
export function useAuth(): AuthValue {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used inside <AuthProvider>");
  return ctx;
}
