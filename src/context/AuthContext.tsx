import { createContext, useContext, useEffect, useState, type ReactNode } from "react";
import * as api from "../lib/auth";
import type { SchoolAccount, SignUpInput } from "../lib/auth";
import { supabase } from "../lib/supabase";

interface AuthValue {
  account: SchoolAccount | null;
  isLoading: boolean;
  signUp: (input: SignUpInput) => Promise<boolean>;
  verifySignupOtp: (email: string, token: string) => Promise<void>;
  logIn: (email: string, password: string) => Promise<void>;
  requestPasswordReset: (email: string) => Promise<void>;
  logOut: () => Promise<void>;
}

const AuthContext = createContext<AuthValue | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [account, setAccount] = useState<SchoolAccount | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [authError, setAuthError] = useState("");
  const [schoolRegistrationError, setSchoolRegistrationError] = useState("");

  useEffect(() => {
    let active = true;
    const registrationTimers = new Set<number>();
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      if (!active) return;
      if (!session) {
        setAccount(null);
        return;
      }

      const timer = window.setTimeout(() => {
        registrationTimers.delete(timer);
        if (!active) return;
        void api
          .submitPendingSchoolCreation(session.user)
          .then(() => api.schoolAccountFromUser(session.user))
          .then((schoolAccount) => {
            if (!active) return;
            setAccount(schoolAccount);
            setSchoolRegistrationError("");
          })
          .catch((error: unknown) => {
            if (active) {
              setSchoolRegistrationError(
                error instanceof Error ? error.message : "Unable to load your school details.",
              );
            }
          });
      }, 0);
      registrationTimers.add(timer);
    });

    api
      .getSession()
      .then((session) => {
        if (active) setAccount(session);
      })
      .catch((error: unknown) => {
        if (active) setAuthError(error instanceof Error ? error.message : "Unable to load your account.");
      })
      .finally(() => {
        if (active) setIsLoading(false);
      });

    return () => {
      active = false;
      registrationTimers.forEach((timer) => window.clearTimeout(timer));
      subscription.unsubscribe();
    };
  }, []);

  const value: AuthValue = {
    account,
    isLoading,
    signUp: async (input) => {
      setSchoolRegistrationError("");
      try {
        const signedInAccount = await api.signUp(input);
        setAccount(signedInAccount);
        return signedInAccount !== null;
      } catch (error) {
        setSchoolRegistrationError(
          error instanceof Error ? error.message : "Unable to save your school details.",
        );
        throw error;
      }
    },
    verifySignupOtp: async (email, token) => {
      setSchoolRegistrationError("");
      try {
        setAccount(await api.verifySignupOtp(email, token));
      } catch (error) {
        setSchoolRegistrationError(
          error instanceof Error ? error.message : "Unable to verify your email.",
        );
        throw error;
      }
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
        Unable to load your account: {authError}
      </div>
    );
  }

  return (
    <AuthContext.Provider value={value}>
      {schoolRegistrationError && (
        <div role="alert" className="m-6 rounded-xl border border-danger/30 bg-danger/5 px-4 py-3 text-sm font-medium text-danger">
          Unable to save your school details: {schoolRegistrationError}
        </div>
      )}
      {children}
    </AuthContext.Provider>
  );
}

// eslint-disable-next-line react-refresh/only-export-components
export function useAuth(): AuthValue {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used inside <AuthProvider>");
  return ctx;
}
