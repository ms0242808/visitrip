import { createContext, useCallback, useContext, useEffect, useState, type ReactNode } from "react";
import type { User } from "@visitrip/shared";
import { api } from "./api";

type AuthState =
  | { status: "loading"; user: null }
  | { status: "anon"; user: null }
  | { status: "authed"; user: User };

interface AuthContextValue {
  state: AuthState;
  signIn: (email: string, password: string) => Promise<void>;
  signUp: (email: string, password: string, name: string) => Promise<void>;
  signOut: () => Promise<void>;
  refresh: () => Promise<void>;
}

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState<AuthState>({ status: "loading", user: null });

  const refresh = useCallback(async () => {
    const user = await api.getSession();
    setState(user ? { status: "authed", user } : { status: "anon", user: null });
  }, []);

  useEffect(() => {
    refresh().catch(() => setState({ status: "anon", user: null }));
  }, [refresh]);

  const signIn = useCallback(async (email: string, password: string) => {
    const { user } = await api.signIn(email, password);
    setState({ status: "authed", user });
  }, []);

  const signUp = useCallback(async (email: string, password: string, name: string) => {
    const { user } = await api.signUp(email, password, name);
    setState({ status: "authed", user });
  }, []);

  const signOut = useCallback(async () => {
    await api.signOut().catch(() => undefined);
    setState({ status: "anon", user: null });
  }, []);

  return (
    <AuthContext.Provider value={{ state, signIn, signUp, signOut, refresh }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
}
