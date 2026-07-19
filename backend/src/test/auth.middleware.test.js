import { describe, it, expect } from "vitest";
import request from "supertest";
import { app } from "../app.js";

describe("verifyJWT middleware", () => {
  it("returns 401 when no token is supplied", async () => {
    const res = await request(app).get("/api/v1/user/getCurrentUser");
    expect(res.status).toBe(401);
    expect(res.body.success).toBe(false);
  });

  it("returns 401 for a malformed/invalid token", async () => {
    const res = await request(app)
      .get("/api/v1/user/getCurrentUser")
      .set("Authorization", "Bearer not.a.valid.jwt");
    expect(res.status).toBe(401);
    expect(res.body.success).toBe(false);
  });
});
