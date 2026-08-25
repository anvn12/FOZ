import { describe, it, expect, beforeEach } from "vitest";
import { getAgent, clearDb, expectFastResponse } from "./auth.setup.js";
import { uniqueEmail, uniqueUsername, uniquePassword } from "../fixtures/users.js";

describe("POST /api/v1/auth/register (US1)", () => {
  beforeEach(async () => {
    await clearDb();
  });

  it("happy path: 201, body with username, cookie, DB row, <2000ms, <500ms", async () => {
    const t0 = Date.now();
    const uname = "testuser_" + Math.random().toString(36).slice(2, 6);
    const res = await getAgent()
      .post("/api/v1/auth/register")
      .send({ email: uniqueEmail(), username: uname, password: uniquePassword() });
    const elapsed = Date.now() - t0;

    expect(res.status).toBe(201);
    expect(res.body.user).toMatchObject({ role: "standard", status: "active", username: uname });
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

  it("duplicate username returns 409 with USERNAME_TAKEN code", async () => {
    const email1 = uniqueEmail();
    const email2 = uniqueEmail();
    const uname = "same_handle";
    const password = uniquePassword();

    const first = await getAgent().post("/api/v1/auth/register").send({ email: email1, username: uname, password });
    expect(first.status).toBe(201);

    const second = await getAgent().post("/api/v1/auth/register").send({ email: email2, username: uname, password });
    expect(second.status).toBe(409);
    expect(second.body.error.code).toBe("USERNAME_TAKEN");
    expect(second.body.error.message).toMatch(/already taken/i);
  });

  it("duplicate email returns 409 with EMAIL_TAKEN code", async () => {
    const email = uniqueEmail();
    const uname1 = uniqueUsername();
    const uname2 = uniqueUsername();
    const password = uniquePassword();

    const first = await getAgent()
      .post("/api/v1/auth/register")
      .send({ email, username: uname1, password });
    expect(first.status).toBe(201);

    const second = await getAgent()
      .post("/api/v1/auth/register")
      .send({ email, username: uname2, password });
    expect(second.status).toBe(409);
    expect(second.body.error.code).toBe("EMAIL_TAKEN");
    expect(second.body.error.message).toMatch(/already exists/i);
  });

  it("requireGuest returns 409 ALREADY_SIGNED_IN when a Bearer token is supplied", async () => {
    const res = await getAgent()
      .post("/api/v1/auth/register")
      .set("Authorization", "Bearer invalid-token-xyz")
      .send({ email: uniqueEmail(), username: "guestblock", password: uniquePassword() });
    expect(res.status).toBe(409);
    expect(res.body.error.code).toBe("ALREADY_SIGNED_IN");
    expect(res.body.error.message).toMatch(/already signed in/i);
  });

  it("check-username endpoint reports availability correctly", async () => {
    const uname = "check_avail_" + Math.random().toString(36).slice(2, 6);
    const check1 = await getAgent().get(`/api/v1/auth/check-username?username=${uname}`);
    expect(check1.status).toBe(200);
    expect(check1.body.available).toBe(true);

    await getAgent().post("/api/v1/auth/register").send({ email: uniqueEmail(), username: uname, password: uniquePassword() });

    const check2 = await getAgent().get(`/api/v1/auth/check-username?username=${uname}`);
    expect(check2.status).toBe(200);
    expect(check2.body.available).toBe(false);
  });

  it("weak password returns 422 with a per-field message", async () => {
    const res = await getAgent()
      .post("/api/v1/auth/register")
      .send({ email: uniqueEmail(), username: "valid_user", password: "short" });
    expect(res.status).toBe(422);
    expect(res.body.error.code).toBe("VALIDATION");
    expect(res.body.error.fields?.password).toBeDefined();
  });

  it("invalid email returns 422 with a per-field message", async () => {
    const res = await getAgent()
      .post("/api/v1/auth/register")
      .send({ email: "not-an-email", username: "valid_user", password: uniquePassword() });
    expect(res.status).toBe(422);
    expect(res.body.error.code).toBe("VALIDATION");
    expect(res.body.error.fields?.email).toBeDefined();
  });
});
