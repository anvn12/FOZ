import { describe, it, expect, beforeEach } from "vitest";
import { getAgent, clearDb, expectFastResponse } from "./auth.setup.js";
import { uniqueEmail, uniquePassword } from "../fixtures/users.js";

describe("POST /api/v1/auth/register (US1)", () => {
  beforeEach(async () => {
    await clearDb();
  });

  it("happy path: 201, body, cookie, DB row, <2000ms, <500ms", async () => {
    const t0 = Date.now();
    const res = await getAgent()
      .post("/api/v1/auth/register")
      .send({ email: uniqueEmail(), password: uniquePassword() });
    const elapsed = Date.now() - t0;

    expect(res.status).toBe(201);
    expect(res.body.user).toMatchObject({ role: "standard", status: "active" });
    expect(typeof res.body.accessToken).toBe("string");
    expect(res.body.accessToken.length).toBeGreaterThan(0);
    expect(elapsed).toBeLessThan(2000); // SC-001 budget
    expectFastResponse(res, 500); // SC-005

    const cookie = res.headers["set-cookie"];
    expect(cookie).toBeDefined();
    const raw = Array.isArray(cookie) ? cookie.join("\n") : cookie ?? "";
    expect(raw).toMatch(/refresh_token=/);
    expect(raw).toMatch(/HttpOnly/i);
    expect(raw).toMatch(/SameSite=Lax/i);
    expect(raw).toMatch(/Path=\/api\/v1\/auth/i);
  });

  it("duplicate email returns 409 with a generic message", async () => {
    const email = uniqueEmail();
    const password = uniquePassword();
    const first = await getAgent().post("/api/v1/auth/register").send({ email, password });
    expect(first.status).toBe(201);

    const second = await getAgent().post("/api/v1/auth/register").send({ email, password });
    expect(second.status).toBe(409);
    expect(second.body.error.code).toBe("EMAIL_TAKEN");
    expect(second.body.error.message).toMatch(/already exists/i);
  });

  it("weak password returns 422 with a per-field message", async () => {
    const res = await getAgent()
      .post("/api/v1/auth/register")
      .send({ email: uniqueEmail(), password: "short" });
    expect(res.status).toBe(422);
    expect(res.body.error.code).toBe("VALIDATION");
    expect(res.body.error.fields?.password).toBeDefined();
  });

  it("invalid email returns 422 with a per-field message", async () => {
    const res = await getAgent()
      .post("/api/v1/auth/register")
      .send({ email: "not-an-email", password: uniquePassword() });
    expect(res.status).toBe(422);
    expect(res.body.error.code).toBe("VALIDATION");
    expect(res.body.error.fields?.email).toBeDefined();
  });

  it("response uses the central error envelope shape", async () => {
    const res = await getAgent()
      .post("/api/v1/auth/register")
      .send({ email: "not-an-email", password: uniquePassword() });
    expect(res.body).toEqual({
      error: {
        code: "VALIDATION",
        message: expect.any(String),
        fields: expect.any(Object),
      },
    });
  });
});
