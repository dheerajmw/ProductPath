/** Upstream API used by the /pp-api route handler (server-only). */
export function getRemoteApiUrl(): string {
  return (
    process.env.NEXT_PUBLIC_API_URL?.trim() ||
    process.env.API_URL?.trim() ||
    "http://localhost:4000"
  ).replace(/\/$/, "");
}

/** Rewrite Set-Cookie so the session is stored on the Vercel host, not Render. */
export function normalizeSetCookie(header: string): string {
  return header
    .replace(/;\s*Domain=[^;]*/gi, "")
    .replace(/;\s*SameSite=None/gi, "; SameSite=Lax")
    .replace(/;\s*SameSite=Strict/gi, "; SameSite=Lax");
}

export function shouldUseBrowserProxy(): boolean {
  if (typeof window === "undefined") return false;
  const host = window.location.hostname;
  return host !== "localhost" && host !== "127.0.0.1";
}
