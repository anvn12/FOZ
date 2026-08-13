import { describe, it, expect, beforeEach } from "vitest";
import { getAgent, clearDb, expectFastResponse } from "./auth.setup.js";
import { uniqueEmail, uniqueUsername, uniquePassword } from "../fixtures/users.js";

async function registerAndGetToken() {
  const email = uniqueEmail();
  const username = uniqueUsername();
  const password = uniquePassword();
  const res = await getAgent().post("/api/v1/auth/register").send({ email, username, password });
  expect(res.status).toBe(201);
  return { email, password, accessToken: res.body.accessToken as string };
}

describe("PATCH /api/v1/auth/password (US5)", () => {
  beforeEach(async () => {
    await clearDb();
  });

  it("happy path: changes password; new password works on next login, old does not", async () => {
    const { email, password, accessToken } = await registerAndGetToken();
    const newPassword = uniquePassword();

    const res = await getAgent()
      .patch("/api/v1/auth/password")
      .set("Authorization", `Bearer ${accessToken}`)
      .send({ currentPassword: password, newPassword });
    expect(res.status).toBe(200);
    expect(res.body).toEqual({ ok: true });
    expectFastResponse(res, 500);

    const newLogin = await getAgent().post("/api/v1/auth/login").send({ email, password: newPassword });
    expect(newLogin.status).toBe(200);

    const oldLogin = await getAgent().post("/api/v1/auth/login").send({ email, password });
    expect(oldLogin.status).toBe(401);
  });

  it("wrong current password returns 401", async () => {
    const { accessToken } = await registerAndGetToken();
    const res = await getAgent()
      .patch("/api/v1/auth/password")
      .set("Authorization", `Bearer ${accessToken}`)
      .send({ currentPassword: "wrongoldpwd1", newPassword: "newpass1234" });
    expect(res.status).toBe(401);
    expect(res.body.error.code).toBe("INCORRECT_CURRENT_PASSWORD");
    expect(res.body.error.message).toBe("Incorrect current password");
  });

  it("new password equal to current returns 422", async () => {
    const { password, accessToken } = await registerAndGetToken();
    const res = await getAgent()
      .patch("/api/v1/auth/password")
      .set("Authorization", `Bearer ${accessToken}`)
      .send({ currentPassword: password, newPassword: password });
    expect(res.status).toBe(422);
    expect(res.body.error.code).toBe("VALIDATION");
    expect(res.body.error.fields?.newPassword).toBeDefined();
  });

  it("new password too weak returns 422", async () => {
    const { password, accessToken } = await registerAndGetToken();
    const res = await getAgent()
      .patch("/api/v1/auth/password")
      .set("Authorization", `Bearer ${accessToken}`)
      .send({ currentPassword: password, newPassword: "short" });
    expect(res.status).toBe(422);
    expect(res.body.error.code).toBe("VALIDATION");
    expect(res.body.error.fields?.newPassword).toBeDefined();
  });

  it("missing access token returns 401", async () => {
    const res = await getAgent()
      .patch("/api/v1/auth/password")
      .send({ currentPassword: "anything1", newPassword: "newpass1234" });
    expect(res.status).toBe(401);
  });
});
