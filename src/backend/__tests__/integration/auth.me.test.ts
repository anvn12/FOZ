import { describe, it, expect, beforeEach } from "vitest";
import { eq } from "drizzle-orm";
import { getAgent, clearDb } from "./auth.setup.js";
import { uniqueEmail, uniqueUsername, uniquePassword } from "../fixtures/users.js";
import { db } from "#backend/db/client.js";
import { userAccounts } from "#backend/db/schema/index.js";

async function registerAndGetToken(): Promise<{ accessToken: string; email: string }> {
  const email = uniqueEmail();
  const res = await getAgent().post("/api/v1/auth/register").send({
    email,
    username: uniqueUsername(),
    password: uniquePassword(),
  });
  expect(res.status).toBe(201);
  return { accessToken: res.body.accessToken as string, email };
}

describe("GET /api/v1/auth/me (OAuth redirect helper)", () => {
  beforeEach(async () => {
    await clearDb();
  });

  it("happy path: returns the authenticated user for a valid Bearer token", async () => {
    const { accessToken } = await registerAndGetToken();
    const res = await getAgent()
      .get("/api/v1/auth/me")
      .set("Authorization", `Bearer ${accessToken}`);

    expect(res.status).toBe(200);
    expect(res.body.user).toMatchObject({ role: "standard", status: "active" });
    expect(typeof res.body.user.id).toBe("string");
    expect(typeof res.body.user.email).toBe("string");
    expect(typeof res.body.user.username).toBe("string");
    expect(res.body.accessToken).toBeUndefined(); // no secrets in the response
  });

  it("returns 401 with no token", async () => {
    const res = await getAgent().get("/api/v1/auth/me");
    expect(res.status).toBe(401);
    expect(res.body.error.code).toBe("UNAUTHENTICATED");
  });

  it("returns 401 for a malformed token", async () => {
    const res = await getAgent().get("/api/v1/auth/me").set("Authorization", "Bearer not-a-jwt");
    expect(res.status).toBe(401);
    expect(res.body.error.code).toBe("UNAUTHENTICATED");
  });

  it("returns 401 when the token's user no longer exists", async () => {
    const { accessToken, email } = await registerAndGetToken();
    await db.delete(userAccounts).where(eq(userAccounts.email, email));

    const res = await getAgent()
      .get("/api/v1/auth/me")
      .set("Authorization", `Bearer ${accessToken}`);
    expect(res.status).toBe(401);
    expect(res.body.error.code).toBe("UNAUTHENTICATED");
  });

  it("returns 403 for a non-active account", async () => {
    const { accessToken, email } = await registerAndGetToken();
    await db.update(userAccounts).set({ status: "suspended" }).where(eq(userAccounts.email, email));

    const res = await getAgent()
      .get("/api/v1/auth/me")
      .set("Authorization", `Bearer ${accessToken}`);
    expect(res.status).toBe(403);
    expect(res.body.error.code).toBe("ACCOUNT_NOT_ACTIVE");
    expect(res.body.error.message).toBe("Your account is not currently available");
  });
});