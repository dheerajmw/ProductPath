import { describe, expect, it } from "vitest";
import { getSessionTokenFromRequest } from "./session-token";

describe("getSessionTokenFromRequest", () => {
  it("reads pp_session cookie", () => {
    const req = { cookies: { pp_session: "abc" }, headers: {} } as never;
    expect(getSessionTokenFromRequest(req)).toBe("abc");
  });

  it("reads Authorization Bearer header", () => {
    const req = {
      cookies: {},
      headers: { authorization: "Bearer secret-token" },
    } as never;
    expect(getSessionTokenFromRequest(req)).toBe("secret-token");
  });

  it("prefers cookie over Bearer", () => {
    const req = {
      cookies: { pp_session: "from-cookie" },
      headers: { authorization: "Bearer from-header" },
    } as never;
    expect(getSessionTokenFromRequest(req)).toBe("from-cookie");
  });
});
