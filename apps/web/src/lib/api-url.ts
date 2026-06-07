/** Public Render/Railway API URL — used for Vercel rewrites and local dev. */
export const REMOTE_API_URL =
  process.env.NEXT_PUBLIC_API_URL?.trim() || "http://localhost:4000";

const PROXY_PREFIX = "/pp-api";

function isLocalApi(url: string): boolean {
  return /localhost|127\.0\.0\.1/.test(url);
}

/**
 * Browser calls use same-origin `/pp-api/*` (Next.js rewrite → Render) whenever the
 * API is not localhost. Session cookies stay first-party on the Vercel domain.
 * Server-side code uses REMOTE_API_URL directly.
 */
export function getApiBaseUrl(): string {
  if (typeof window !== "undefined" && !isLocalApi(REMOTE_API_URL)) {
    return PROXY_PREFIX;
  }
  return REMOTE_API_URL;
}
