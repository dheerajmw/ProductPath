"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from "react";
import { api, type User } from "@/lib/api";
import {
  fetchMeCached,
  fetchMeFresh,
  getCachedUser,
  invalidateMeCache,
  seedMeCache,
} from "@/lib/me-cache";

type AuthContextValue = {
  user: User | null;
  loading: boolean;
  /** Seed context, verify cookie via /auth/me, or throw if session cannot persist. */
  establishSession: (user: User) => Promise<User>;
  refresh: () => Promise<User | null>;
  logout: () => Promise<void>;
};

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const authGeneration = useRef(0);

  const refresh = useCallback(async () => {
    const gen = authGeneration.current;
    try {
      const me = await fetchMeCached();
      if (gen !== authGeneration.current) {
        return getCachedUser();
      }
      setUser(me);
      return me;
    } catch {
      if (gen !== authGeneration.current) {
        return getCachedUser();
      }
      const cached = getCachedUser();
      if (cached) {
        setUser(cached);
        return cached;
      }
      invalidateMeCache();
      setUser(null);
      return null;
    }
  }, []);

  useEffect(() => {
    void refresh().finally(() => setLoading(false));
  }, [refresh]);

  const establishSession = useCallback(async (known: User) => {
    authGeneration.current += 1;
    const gen = authGeneration.current;
    seedMeCache(known);
    setUser(known);
    setLoading(false);

    try {
      const verified = await fetchMeFresh();
      if (gen !== authGeneration.current) {
        return getCachedUser() ?? verified;
      }
      seedMeCache(verified);
      setUser(verified);
      return verified;
    } catch {
      invalidateMeCache();
      setUser(null);
      throw new Error("Session could not be verified. Please try logging in again.");
    }
  }, []);

  const logout = useCallback(async () => {
    authGeneration.current += 1;
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
