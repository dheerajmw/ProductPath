/** Enable with NEXT_PUBLIC_AUTH_DEBUG=1 in Vercel or local .env */
import { getStoredSessionToken } from "@/lib/session-token";

const ENABLED =
  process.env.NEXT_PUBLIC_AUTH_DEBUG === "1" ||
  (typeof window !== "undefined" && (window as unknown as { __PP_AUTH_DEBUG?: boolean }).__PP_AUTH_DEBUG === true);

export type AuthDebugPayload = {
  event: string;
  token?: string | null;
  user?: { id: string; email: string } | null;
  loading?: boolean;
  pathname?: string;
  isAuthenticated?: boolean;
  detail?: string;
  stack?: string;
};

export function authDebug(payload: AuthDebugPayload) {
  if (!ENABLED) return;
  const pathname =
    payload.pathname ??
    (typeof window !== "undefined" ? window.location.pathname : undefined);
  const token =
    payload.token !== undefined
      ? payload.token
      : typeof document !== "undefined"
        ? document.cookie.includes("pp_session=")
          ? "[httpOnly pp_session present]"
          : null
        : undefined;

  console.log("[ProductPath Auth]", {
    ...payload,
    pathname,
    token,
    localStorageToken: typeof window !== "undefined" ? getStoredSessionToken() : null,
    ts: new Date().toISOString(),
  });
}

export function authRedirect(source: string, to: string, detail?: string) {
  authDebug({
    event: "REDIRECT",
    detail: `${source} → ${to}${detail ? ` (${detail})` : ""}`,
    stack: new Error().stack?.split("\n").slice(1, 4).join("\n"),
  });
}
