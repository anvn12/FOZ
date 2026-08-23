import { describe, it, expect, beforeEach } from "vitest";
import { getAgent, clearDb, expectFastResponse } from "./auth.setup.js";
import { uniqueEmail, uniqueUsername, uniquePassword } from "../fixtures/users.js";

async function registerAndGetCookie(): Promise<{ accessToken: string; refreshCookie: string }> {
  const email = uniqueEmail();
  const username = uniqueUsername();
  const password = uniquePassword();
  const res = await getAgent().post("/api/v1/auth/register").send({ email, username, password });
  expect(res.status).toBe(201);
  const cookie = (res.headers["set-cookie"] ?? []) as string | string[];
  const refreshCookie: string = Array.isArray(cookie)
    ? cookie.map((c) => c.split(";")[0] ?? "").join("; ")
    : (cookie.split(";")[0] ?? "");
  return {
    accessToken: res.body.accessToken as string,
    refreshCookie,
  };
}

describe("POST /api/v1/auth/logout (US3)", () => {
  beforeEach(async () => {
    await clearDb();
  });

  it("signed-in logout returns 200, clears the cookie, and revokes the refresh session", async () => {
    const { accessToken, refreshCookie } = await registerAndGetCookie();
    const res = await getAgent()
      .post("/api/v1/auth/logout")
      .set("Authorization", `Bearer ${accessToken}`)
      .set("Cookie", refreshCookie);

    expect(res.status).toBe(200);
    expect(res.body).toEqual({ ok: true });
    expectFastResponse(res, 500);

    const setCookie = res.headers["set-cookie"];
    const raw = Array.isArray(setCookie) ? setCookie.join("\n") : setCookie ?? "";
    expect(raw).toMatch(/refresh_token=/);
    expect(raw).toMatch(/(Max-Age=0|Expires=Thu, 01 Jan 1970)/i);
  });

  it("a refresh attempt with the revoked cookie returns 401", async () => {
    const { accessToken, refreshCookie } = await registerAndGetCookie();
    const logoutRes = await getAgent()
      .post("/api/v1/auth/logout")
      .set("Authorization", `Bearer ${accessToken}`)
      .set("Cookie", refreshCookie);
    expect(logoutRes.status).toBe(200);

    const refreshRes = await getAgent()
      .post("/api/v1/auth/refresh")
      .set("Cookie", refreshCookie);
    expect(refreshRes.status).toBe(401);
  });

  it("logout without a session cookie returns 200 ok (idempotent, no error)", async () => {
    const res = await getAgent().post("/api/v1/auth/logout").send({});
    expect(res.status).toBe(200);
    expect(res.body).toEqual({ ok: true });
  });
});
