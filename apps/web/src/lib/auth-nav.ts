import type { AppRouterInstance } from "next/dist/shared/lib/app-router-context.shared-runtime";
import { authRedirect } from "@/lib/auth-debug";

type LoginRedirectOptions = {
  role?: "candidate" | "recruiter";
};

/** Single entry point for client-side redirects to login (traceable in auth debug). */
export function navigateToLogin(
  router: AppRouterInstance,
  source: string,
  options: LoginRedirectOptions = {},
) {
  const role = options.role ?? "candidate";
  const path = role === "recruiter" ? "/login?role=recruiter" : "/login?role=candidate";
  authRedirect(source, path);
  router.replace(path);
}
