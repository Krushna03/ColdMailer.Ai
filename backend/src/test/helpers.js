import request from "supertest";
import { app } from "../app.js";

let counter = 0;

// Registers a fresh user and returns the response, the payload used, and the
// issued access token (for `Authorization: Bearer` headers in protected routes).
export const registerUser = async (overrides = {}) => {
  counter += 1;
  const payload = {
    username: "testuser",
    email: `user_${Date.now()}_${counter}@example.com`,
    password: "password123",
    ...overrides,
  };

  const res = await request(app).post("/api/v1/user/register").send(payload);
  return { res, payload, token: res.body?.data?.accessToken };
};
