import { describe, expect, it, afterEach } from "vitest";
import { isCrossOriginSession, sessionCookieOptions } from "./session-cookie";

describe("session cookies (Vercel + Render)", () => {
  const env = process.env;

  afterEach(() => {
    process.env = env;
  });

  it("uses SameSite=None when production API_URL is a public host", () => {
    process.env = {
      ...env,
      NODE_ENV: "production",
      API_URL: "https://productpath-api-qme4.onrender.com",
    };
    delete process.env.WEB_APP_URL;
    delete process.env.SESSION_COOKIE_SAMESITE;

    expect(isCrossOriginSession()).toBe(true);
    expect(sessionCookieOptions()).toMatchObject({
      sameSite: "none",
      secure: true,
      httpOnly: true,
    });
  });

  it("uses SameSite=Lax for local development", () => {
    process.env = {
      ...env,
      NODE_ENV: "development",
      API_URL: "http://localhost:4000",
      WEB_APP_URL: "http://localhost:3000",
    };

    expect(isCrossOriginSession()).toBe(false);
    expect(sessionCookieOptions().sameSite).toBe("lax");
  });
});
