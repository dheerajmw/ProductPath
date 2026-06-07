import { SESSION_COOKIE, SESSION_DAYS } from "@productpath/shared";

/** Upstream API used by the /pp-api route handler (server-only). */
export function getRemoteApiUrl(): string {
  return (
    process.env.NEXT_PUBLIC_API_URL?.trim() ||
    process.env.API_URL?.trim() ||
    "http://localhost:4000"
  ).replace(/\/$/, "");
}

export function shouldUseBrowserProxy(): boolean {
  if (typeof window === "undefined") return false;
  const host = window.location.hostname;
  return host !== "localhost" && host !== "127.0.0.1";
}

/** Extract session token from upstream Set-Cookie header(s). */
export function extractSessionToken(setCookieHeaders: string[]): string | null {
  for (const header of setCookieHeaders) {
    const match = header.match(new RegExp(`${SESSION_COOKIE}=([^;]+)`));
    if (match?.[1]) return match[1];
  }
  return null;
}

export const sessionCookieOptions = {
  httpOnly: true,
  secure: true,
  sameSite: "lax" as const,
  path: "/",
  maxAge: SESSION_DAYS * 24 * 60 * 60,
};

export function readSetCookieHeaders(headers: Headers): string[] {
  if (typeof headers.getSetCookie === "function") {
    return headers.getSetCookie();
  }
  const single = headers.get("set-cookie");
  return single ? [single] : [];
}
