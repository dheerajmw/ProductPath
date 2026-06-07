/**
 * CORS allowlist for browser clients (Vercel web, local dev).
 * In production, also permits *.vercel.app preview deployments.
 */
export function getConfiguredCorsOrigins(): string[] {
  return (process.env.CORS_ORIGINS ?? "http://localhost:3000,http://localhost:3001")
    .split(",")
    .map((o) => o.trim())
    .filter(Boolean);
}

export function isAllowedCorsOrigin(origin: string): boolean {
  const allowed = getConfiguredCorsOrigins();
  if (allowed.includes(origin)) return true;

  if (process.env.NODE_ENV !== "production") return false;

  try {
    const hostname = new URL(origin).hostname;
    if (hostname.endsWith(".vercel.app")) return true;

    const webUrl = process.env.WEB_APP_URL?.trim();
    if (webUrl) {
      const webHost = new URL(webUrl).hostname;
      if (hostname === webHost) return true;
    }
  } catch {
    return false;
  }

  return false;
}
