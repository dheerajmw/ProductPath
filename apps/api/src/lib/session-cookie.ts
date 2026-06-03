import { SESSION_COOKIE, SESSION_DAYS } from "@productpath/shared";
import type { CookieOptions, Response } from "express";

function isCrossOriginSession(): boolean {
  if (process.env.SESSION_COOKIE_SAMESITE === "none") return true;
  if (process.env.NODE_ENV !== "production") return false;

  const web = process.env.WEB_APP_URL?.trim();
  const api = (process.env.API_URL ?? process.env.PUBLIC_API_URL)?.trim();
  if (!web || !api) return false;

  try {
    return new URL(web).hostname !== new URL(api).hostname;
  } catch {
    return false;
  }
}

export function sessionCookieOptions(): CookieOptions {
  const crossOrigin = isCrossOriginSession();
  const isProd = process.env.NODE_ENV === "production";

  return {
    httpOnly: true,
    secure: crossOrigin || isProd,
    sameSite: crossOrigin ? "none" : "lax",
    maxAge: SESSION_DAYS * 24 * 60 * 60 * 1000,
    path: "/",
  };
}

export function setSessionCookie(res: Response, token: string) {
  res.cookie(SESSION_COOKIE, token, sessionCookieOptions());
}

export function clearSessionCookie(res: Response) {
  res.clearCookie(SESSION_COOKIE, sessionCookieOptions());
}
