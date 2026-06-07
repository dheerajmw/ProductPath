"use client";

import { useEffect } from "react";
import { usePathname, useRouter } from "next/navigation";
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
