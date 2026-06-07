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
import { usePathname } from "next/navigation";
import { api, type User } from "@/lib/api";
import { authDebug } from "@/lib/auth-debug";
import {
  fetchMeCached,
  fetchMeFresh,
  getCachedUser,
  invalidateMeCache,
  seedMeCache,
} from "@/lib/me-cache";

export type AuthStatus = "loading" | "authenticated" | "unauthenticated";

type AuthContextValue = {
  user: User | null;
  loading: boolean;
  status: AuthStatus;
  establishSession: (user: User) => Promise<User>;
  refresh: () => Promise<User | null>;
  logout: () => Promise<void>;
};

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  const [user, setUser] = useState<User | null>(null);
  const [status, setStatus] = useState<AuthStatus>("loading");
  const authGeneration = useRef(0);
  const initDone = useRef(false);

  const loading = status === "loading";

  const logState = useCallback(
    (event: string, extra?: Record<string, unknown>) => {
      authDebug({
        event,
        user: user ? { id: user.id, email: user.email } : null,
        loading: status === "loading",
        isAuthenticated: status === "authenticated",
        pathname,
        detail: extra ? JSON.stringify(extra) : undefined,
      });
    },
    [user, status, pathname],
  );

  const refresh = useCallback(async () => {
    const gen = authGeneration.current;
    logState("refresh:start");
    try {
      const me = await fetchMeCached();
      if (gen !== authGeneration.current) {
        logState("refresh:stale-skipped", { gen, current: authGeneration.current });
        return getCachedUser();
      }
      setUser(me);
      setStatus("authenticated");
      logState("refresh:ok");
      return me;
    } catch (err) {
      if (gen !== authGeneration.current) {
        logState("refresh:stale-error-skipped");
        return getCachedUser();
      }
      const cached = getCachedUser();
      if (cached) {
        setUser(cached);
        setStatus("authenticated");
        logState("refresh:fallback-cache");
        return cached;
      }
      invalidateMeCache();
      setUser(null);
      setStatus("unauthenticated");
      logState("refresh:unauthenticated", {
        error: err instanceof Error ? err.message : String(err),
      });
      return null;
    }
  }, [logState]);

  useEffect(() => {
    if (initDone.current) return;
    initDone.current = true;
    logState("init:start");
    void refresh().finally(() => logState("init:done"));
  }, [refresh, logState]);

  const establishSession = useCallback(
    async (known: User) => {
      authGeneration.current += 1;
      const gen = authGeneration.current;
      logState("establishSession:start", { userId: known.id });

      // Do NOT setUser before cookie is verified — prevents premature redirects.
      try {
        seedMeCache(known);
        const verified = await fetchMeFresh();
        if (gen !== authGeneration.current) {
          logState("establishSession:stale");
          return getCachedUser() ?? verified;
        }
        seedMeCache(verified);
        setUser(verified);
        setStatus("authenticated");
        logState("establishSession:verified", { userId: verified.id });
        return verified;
      } catch (err) {
        invalidateMeCache();
        setUser(null);
        setStatus("unauthenticated");
        logState("establishSession:failed", {
          error: err instanceof Error ? err.message : String(err),
        });
        throw new Error("Session could not be verified. Please try logging in again.");
      }
    },
    [logState],
  );

  const logout = useCallback(async () => {
    authGeneration.current += 1;
    logState("logout");
    try {
      await api.logout();
    } catch {
      /* clear local state even if API unreachable */
    }
    invalidateMeCache();
    setUser(null);
    setStatus("unauthenticated");
  }, [logState]);

  const value = useMemo(
    () => ({ user, loading, status, establishSession, refresh, logout }),
    [user, loading, status, establishSession, refresh, logout],
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
