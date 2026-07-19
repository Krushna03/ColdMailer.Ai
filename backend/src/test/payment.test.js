import { describe, it, expect, vi } from "vitest";

// Force the "payment service not configured" branch deterministically, so the
// test does not depend on whether Razorpay keys exist in the local .env.
vi.mock("../config/razorpay-client.js", () => ({ razorpayInstance: null }));

import request from "supertest";
import { app } from "../app.js";
import { registerUser } from "./helpers.js";

describe("payment endpoints", () => {
  it("exposes plans publicly", async () => {
    const res = await request(app).get("/api/v1/payment/plans");
    expect(res.status).toBe(200);
    expect(Array.isArray(res.body.data)).toBe(true);
  });

  it("requires auth for create-order (401)", async () => {
    const res = await request(app)
      .post("/api/v1/payment/create-order")
      .send({ planType: "PRO" });
    expect(res.status).toBe(401);
  });

  it("returns 503 for create-order when Razorpay is not configured", async () => {
    const { token } = await registerUser({ email: "pay@example.com" });
    const res = await request(app)
      .post("/api/v1/payment/create-order")
      .set("Authorization", `Bearer ${token}`)
      .send({ planType: "PRO" });
    expect(res.status).toBe(503);
    expect(res.body.success).toBe(false);
  });

  it("returns payment history for an authenticated user", async () => {
    const { token } = await registerUser({ email: "payhist@example.com" });
    const res = await request(app)
      .get("/api/v1/payment/history")
      .set("Authorization", `Bearer ${token}`);
    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
  });
});
