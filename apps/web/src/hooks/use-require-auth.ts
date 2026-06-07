"use client";

import { useEffect, type ReactNode } from "react";
import { useRouter } from "next/navigation";
import { Spinner } from "@productpath/ui";
import { useAuth } from "@/lib/auth-context";

type Options = {
  redirectTo?: string;
  /** When true, wait for loading before redirecting unauthenticated users. */
  requireAuth?: boolean;
};

/**
 * Waits for auth initialization before redirecting.
 * Returns { user, loading, ready } — `ready` is false while auth is still loading.
 */
export function useRequireAuth(options: Options = {}) {
  const { redirectTo = "/login", requireAuth = true } = options;
  const router = useRouter();
  const { user, loading } = useAuth();

  useEffect(() => {
    if (!requireAuth || loading) return;
    if (!user) router.replace(redirectTo);
  }, [requireAuth, loading, user, router, redirectTo]);

  return {
    user,
    loading,
    ready: !loading,
    authenticated: Boolean(user),
  };
}

export function AuthLoadingScreen({ label = "Loading…" }: { label?: string }) {
  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        gap: 12,
        padding: 48,
        minHeight: "40vh",
      }}
    >
      <Spinner size={32} />
      <span className="pp-body-muted">{label}</span>
    </div>
  );
}

export function RequireAuth({
  children,
  redirectTo = "/login",
  fallback,
}: {
  children: ReactNode;
  redirectTo?: string;
  fallback?: ReactNode;
}) {
  const { user, loading, ready } = useRequireAuth({ redirectTo });

  if (loading || !ready) {
    return fallback ?? <AuthLoadingScreen />;
  }

  if (!user) return null;

  return children;
}
