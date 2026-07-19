import { describe, it, expect } from "vitest";
import request from "supertest";
import { app } from "../app.js";

describe("public endpoints", () => {
  it("GET /health returns ok", async () => {
    const res = await request(app).get("/health");
    expect(res.status).toBe(200);
    expect(res.body.status).toBe("ok");
  });

  it("GET /api/v1/user/get-user-count returns a numeric count", async () => {
    const res = await request(app).get("/api/v1/user/get-user-count");
    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(typeof res.body.data.totalUsers).toBe("number");
  });

  it("GET /api/v1/payment/plans returns a list of plans", async () => {
    const res = await request(app).get("/api/v1/payment/plans");
    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(Array.isArray(res.body.data)).toBe(true);
  });
});
