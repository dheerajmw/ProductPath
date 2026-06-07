import { describe, expect, it, beforeEach, afterEach } from "vitest";
import { isAllowedCorsOrigin } from "./cors-origins";

describe("isAllowedCorsOrigin", () => {
  const env = process.env;

  beforeEach(() => {
    process.env = { ...env, NODE_ENV: "production" };
  });

  afterEach(() => {
    process.env = env;
  });

  it("allows explicit CORS_ORIGINS entries", () => {
    process.env.CORS_ORIGINS = "https://product-path.vercel.app";
    expect(isAllowedCorsOrigin("https://product-path.vercel.app")).toBe(true);
  });

  it("allows any vercel.app subdomain in production", () => {
    process.env.CORS_ORIGINS = "http://localhost:3000";
    expect(isAllowedCorsOrigin("https://product-path-8it3qx773-dheerajmws-projects.vercel.app")).toBe(
      true,
    );
  });

  it("rejects unknown origins in production", () => {
    process.env.CORS_ORIGINS = "https://product-path.vercel.app";
    expect(isAllowedCorsOrigin("https://evil.example.com")).toBe(false);
  });
});
