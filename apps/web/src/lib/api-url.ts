/** Public Render/Railway API URL — used for Vercel rewrites and local dev. */
export const REMOTE_API_URL =
  process.env.NEXT_PUBLIC_API_URL?.trim() || "http://localhost:4000";

const PROXY_PREFIX = "/pp-api";

function isLocalApi(url: string): boolean {
  return /localhost|127\.0\.0\.1/.test(url);
}

/**
 * Browser production calls use same-origin `/pp-api/*` (Next.js rewrite → Render).
 * That lets session cookies stay first-party on the Vercel domain.
 * Local dev still talks to localhost:4000 directly.
 */
export function getApiBaseUrl(): string {
  if (typeof window !== "undefined" && process.env.NODE_ENV === "production" && !isLocalApi(REMOTE_API_URL)) {
    return PROXY_PREFIX;
  }
  return REMOTE_API_URL;
}
