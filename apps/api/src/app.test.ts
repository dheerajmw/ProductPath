import { describe, expect, it } from "vitest";
import request from "supertest";
import { createApp } from "./app";

describe("health", () => {
  it("returns health payload", async () => {
    const app = createApp();
    const res = await request(app).get("/health");
    expect(res.status).toBeLessThanOrEqual(503);
    expect(res.body).toHaveProperty("service", "productpath-api");
  });
});
