"use client";

import { useEffect, type ReactNode } from "react";
import { usePathname, useRouter } from "next/navigation";
import { Spinner } from "@productpath/ui";
import { useAuth } from "@/lib/auth-context";
import { authDebug } from "@/lib/auth-debug";
import { navigateToLogin } from "@/lib/auth-nav";

type Options = {
  redirectTo?: string;
  requireAuth?: boolean;
  loginSource?: string;
};

export function useRequireAuth(options: Options = {}) {
  const {
    requireAuth = true,
    loginSource = "useRequireAuth",
  } = options;
  const router = useRouter();
  const pathname = usePathname();
  const { user, loading, status } = useAuth();

  useEffect(() => {
    if (!requireAuth || loading) return;
    if (!user) {
      authDebug({
        event: "guard:redirect-login",
        loading,
        isAuthenticated: false,
        pathname,
        detail: loginSource,
      });
      navigateToLogin(router, loginSource);
    }
  }, [requireAuth, loading, user, router, pathname, loginSource]);

  return {
    user,
    loading,
    status,
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
  loginSource = "RequireAuth",
  fallback,
}: {
  children: ReactNode;
  loginSource?: string;
  fallback?: ReactNode;
}) {
  const { user, loading, ready } = useRequireAuth({ loginSource });

  if (loading || !ready) {
    return fallback ?? <AuthLoadingScreen label="Checking session…" />;
  }

  if (!user) return null;

  return children;
}
