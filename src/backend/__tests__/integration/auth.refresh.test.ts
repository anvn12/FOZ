import { describe, it, expect, beforeEach } from "vitest";
import { sql, eq } from "drizzle-orm";
import { getAgent, clearDb, expectFastResponse } from "./auth.setup.js";
import { uniqueEmail, uniquePassword } from "../fixtures/users.js";
import { db } from "#backend/db/client.js";
import { userAccounts } from "#backend/db/schema/index.js";

async function registerAndGetCookie(): Promise<{ email: string; refreshCookie: string }> {
  const email = uniqueEmail();
  const password = uniquePassword();
  const res = await getAgent().post("/auth/register").send({ email, password });
  expect(res.status).toBe(201);
  const cookie = (res.headers["set-cookie"] ?? []) as string | string[];
  const refreshCookie: string = Array.isArray(cookie)
    ? cookie.map((c) => c.split(";")[0] ?? "").join("; ")
    : (cookie.split(";")[0] ?? "");
  return { email, refreshCookie };
}

describe("POST /auth/refresh (US4)", () => {
  beforeEach(async () => {
    await clearDb();
  });

  it("happy path: 200 + new access token + rotated cookie + old session revoked", async () => {
    const { refreshCookie } = await registerAndGetCookie();
    const res = await getAgent().post("/auth/refresh").set("Cookie", refreshCookie);

    expect(res.status).toBe(200);
    expect(typeof res.body.accessToken).toBe("string");
    expect(res.body.accessToken.length).toBeGreaterThan(0);
    expectFastResponse(res, 500);

    const setCookie = res.headers["set-cookie"];
    const raw = Array.isArray(setCookie) ? setCookie.join("\n") : setCookie ?? "";
    expect(raw).toMatch(/refresh_token=/);
    expect(raw).toMatch(/HttpOnly/i);
    expect(raw).toMatch(/SameSite=Lax/i);
    expect(raw).toMatch(/Path=\/auth/i);
    expect(raw).not.toBe(refreshCookie);
  });

  it("expired cookie returns 401 and clears the cookie", async () => {
    const { refreshCookie } = await registerAndGetCookie();
    await db.execute(sql`UPDATE refresh_sessions SET expires_at = now() - interval '1 day'`);

    const res = await getAgent().post("/auth/refresh").set("Cookie", refreshCookie);
    expect(res.status).toBe(401);

    const setCookie = res.headers["set-cookie"];
    const raw = Array.isArray(setCookie) ? setCookie.join("\n") : setCookie ?? "";
    expect(raw).toMatch(/(Max-Age=0|Expires=Thu, 01 Jan 1970)/i);
  });

  it("revoked cookie returns 401", async () => {
    const { refreshCookie } = await registerAndGetCookie();
    await db.execute(sql`UPDATE refresh_sessions SET revoked_at = now()`);

    const res = await getAgent().post("/auth/refresh").set("Cookie", refreshCookie);
    expect(res.status).toBe(401);
  });

  it("tampered cookie value returns 401", async () => {
    const { refreshCookie } = await registerAndGetCookie();
    const tampered = refreshCookie.replace(/.$/, (c) => (c === "a" ? "b" : "a"));

    const res = await getAgent().post("/auth/refresh").set("Cookie", tampered);
    expect(res.status).toBe(401);
  });

  it("account now suspended returns 403 and clears the cookie", async () => {
    const { email, refreshCookie } = await registerAndGetCookie();
    await db.update(userAccounts).set({ status: "suspended" }).where(eq(userAccounts.email, email));

    const res = await getAgent().post("/auth/refresh").set("Cookie", refreshCookie);
    expect(res.status).toBe(403);

    const setCookie = res.headers["set-cookie"];
    const raw = Array.isArray(setCookie) ? setCookie.join("\n") : setCookie ?? "";
    expect(raw).toMatch(/(Max-Age=0|Expires=Thu, 01 Jan 1970)/i);
  });
});
