export const TOKEN_KEY = "token";

function normalizeToken(value: string | null | undefined): string | null {
  if (!value) return null;
  const trimmed = value.trim();
  if (!trimmed || trimmed === "undefined" || trimmed === "null") return null;
  return trimmed;
}

export function getStoredSessionToken(): string | null {
  if (typeof window === "undefined") return null;
  return normalizeToken(localStorage.getItem(TOKEN_KEY));
}

export function setStoredSessionToken(token: string | null | undefined): void {
  if (typeof window === "undefined") return;
  const normalized = normalizeToken(token ?? null);
  if (normalized) {
    localStorage.setItem(TOKEN_KEY, normalized);
  } else {
    localStorage.removeItem(TOKEN_KEY);
  }
}

export function getAuthHeader(explicitToken?: string | null): string | undefined {
  const token = normalizeToken(explicitToken ?? getStoredSessionToken());
  return token ? `Bearer ${token}` : undefined;
}

export function buildAuthHeaders(init?: RequestInit, explicitToken?: string | null): Headers {
  const headers = new Headers(init?.headers);
  const isFormData = typeof FormData !== "undefined" && init?.body instanceof FormData;

  if (!isFormData && !headers.has("Content-Type")) {
    headers.set("Content-Type", "application/json");
  }

  const authHeader = getAuthHeader(explicitToken);
  if (authHeader) {
    headers.set("Authorization", authHeader);
  }

  return headers;
}
