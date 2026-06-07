import { describe, expect, it } from "vitest";
import {
  getBearerTokenFromRequest,
  getCookieTokenFromRequest,
  getSessionTokenCandidates,
  getSessionTokenFromRequest,
} from "./session-token";

describe("session token extraction", () => {
  it("reads pp_session cookie", () => {
    const req = { cookies: { pp_session: "abc" }, headers: {} } as never;
    expect(getCookieTokenFromRequest(req)).toBe("abc");
  });

  it("reads Authorization Bearer header (case-insensitive)", () => {
    const req = {
      cookies: {},
      headers: { authorization: "bearer secret-token" },
    } as never;
    expect(getBearerTokenFromRequest(req)).toBe("secret-token");
  });

  it("prefers Bearer over stale cookie when both are present", () => {
    const req = {
      cookies: { pp_session: "stale-cookie" },
      headers: { authorization: "Bearer fresh-token" },
    } as never;
    expect(getSessionTokenCandidates(req)).toEqual(["fresh-token", "stale-cookie"]);
    expect(getSessionTokenFromRequest(req)).toBe("fresh-token");
  });

  it("ignores empty Bearer values", () => {
    const req = {
      cookies: { pp_session: "only-cookie" },
      headers: { authorization: "Bearer   " },
    } as never;
    expect(getSessionTokenCandidates(req)).toEqual(["only-cookie"]);
  });

  it("dedupes when cookie and bearer match", () => {
    const req = {
      cookies: { pp_session: "same" },
      headers: { authorization: "Bearer same" },
    } as never;
    expect(getSessionTokenCandidates(req)).toEqual(["same"]);
  });
});
