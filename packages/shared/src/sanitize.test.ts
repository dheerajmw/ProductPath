import { describe, expect, it } from "vitest";
import { escapeHtml, sanitizeText } from "./sanitize";

describe("sanitize", () => {
  it("escapes HTML", () => {
    expect(escapeHtml('<script>alert("x")</script>')).toBe(
      "&lt;script&gt;alert(&quot;x&quot;)&lt;/script&gt;",
    );
  });

  it("truncates text", () => {
    expect(sanitizeText("  hello  ", 3)).toBe("hel");
  });
});
