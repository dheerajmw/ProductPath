"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import { api, type User } from "@/lib/api";
import { fetchMeCached, invalidateMeCache, seedMeCache } from "@/lib/me-cache";

type AuthContextValue = {
  user: User | null;
  loading: boolean;
  /** Call after login/verify when the API returns the user (seeds cache + context). */
  establishSession: (user: User) => void;
  refresh: () => Promise<User | null>;
  logout: () => Promise<void>;
};

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  const refresh = useCallback(async () => {
    try {
      const me = await fetchMeCached();
      setUser(me);
      return me;
    } catch {
      invalidateMeCache();
      setUser(null);
      return null;
    }
  }, []);

  useEffect(() => {
    void refresh().finally(() => setLoading(false));
  }, [refresh]);

  const establishSession = useCallback((next: User) => {
    seedMeCache(next);
    setUser(next);
    setLoading(false);
  }, []);

  const logout = useCallback(async () => {
    try {
      await api.logout();
    } catch {
      /* clear local state even if API unreachable */
    }
    invalidateMeCache();
    setUser(null);
  }, []);

  const value = useMemo(
    () => ({ user, loading, establishSession, refresh, logout }),
    [user, loading, establishSession, refresh, logout],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth(): AuthContextValue {
  const ctx = useContext(AuthContext);
  if (!ctx) {
    throw new Error("useAuth must be used within AuthProvider");
  }
  return ctx;
}
