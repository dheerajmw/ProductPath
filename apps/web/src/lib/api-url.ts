import { shouldUseBrowserProxy } from "./api-proxy";

/** Public Render/Railway API URL — used by /pp-api route handler and local dev. */
export const REMOTE_API_URL =
  process.env.NEXT_PUBLIC_API_URL?.trim() || "http://localhost:4000";

const PROXY_PREFIX = "/pp-api";

/**
 * Deployed web (any non-localhost host) calls `/pp-api/*` on the same origin.
 * Route handler forwards to Render and rewrites Set-Cookie for first-party sessions.
 */
export function getApiBaseUrl(): string {
  if (shouldUseBrowserProxy()) return PROXY_PREFIX;
  return REMOTE_API_URL;
}
