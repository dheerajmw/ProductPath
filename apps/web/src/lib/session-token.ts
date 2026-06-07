const TOKEN_KEY = "token";

export function getStoredSessionToken(): string | null {
  if (typeof window === "undefined") return null;
  return localStorage.getItem(TOKEN_KEY);
}

export function setStoredSessionToken(token: string | null | undefined): void {
  if (typeof window === "undefined") return;
  if (token) {
    localStorage.setItem(TOKEN_KEY, token);
  } else {
    localStorage.removeItem(TOKEN_KEY);
  }
}

export function getAuthHeader(): string | undefined {
  const token = getStoredSessionToken();
  return token ? `Bearer ${token}` : undefined;
}
