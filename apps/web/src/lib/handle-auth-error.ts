import type { AppRouterInstance } from "next/dist/shared/lib/app-router-context.shared-runtime";
import { ApiError } from "@/lib/api";
import { navigateToLogin } from "@/lib/auth-nav";

/** Call from page catch blocks instead of router.push("/login"). Returns true if handled. */
export function handleUnauthorized(
  router: AppRouterInstance,
  source: string,
  err: unknown,
): boolean {
  if (err instanceof ApiError && err.status === 401) {
    navigateToLogin(router, source);
    return true;
  }
  return false;
}
