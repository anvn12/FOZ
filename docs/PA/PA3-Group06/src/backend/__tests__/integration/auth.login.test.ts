import { describe, it, expect, beforeEach } from "vitest";
import { sql } from "drizzle-orm";
import { getAgent, clearDb, expectFastResponse } from "./auth.setup.js";
import { uniqueEmail, uniquePassword } from "../fixtures/users.js";
import { db } from "#backend/db/client.js";
import { userAccounts } from "#backend/db/schema/index.js";
import { eq } from "drizzle-orm";

async function seedUser(status: "active" | "suspended" | "banned" | "pending" = "active") {
  const email = uniqueEmail();
  const password = uniquePassword();
  // Register first to get a properly hashed password.
  const res = await getAgent().post("/api/v1/auth/register").send({ email, password });
  expect(res.status).toBe(201);
  // Then flip the status if needed.
  if (status !== "active") {
    await db.update(userAccounts).set({ status }).where(eq(userAccounts.email, email));
  }
  return { email, password };
}

describe("POST /api/v1/auth/login (US2)", () => {
  beforeEach(async () => {
    await clearDb();
  });

  it("happy path: 200 + cookie + accessToken, <2000ms, <500ms", async () => {
    const { email, password } = await seedUser("active");
    const t0 = Date.now();
    const res = await getAgent().post("/api/v1/auth/login").send({ email, password });
    const elapsed = Date.now() - t0;

    expect(res.status).toBe(200);
    expect(res.body.user).toMatchObject({ role: "standard", status: "active", email });
    expect(typeof res.body.accessToken).toBe("string");
    expect(res.body.accessToken.length).toBeGreaterThan(0);
    expect(elapsed).toBeLessThan(2000); // SC-002 budget
    expectFastResponse(res, 500); // SC-005

    const cookie = res.headers["set-cookie"];
    const raw = Array.isArray(cookie) ? cookie.join("\n") : cookie ?? "";
    expect(raw).toMatch(/refresh_token=/);
    expect(raw).toMatch(/HttpOnly/i);
    expect(raw).toMatch(/SameSite=Lax/i);
    expect(raw).toMatch(/Path=\/api\/v1\/auth/i);
  });

  it("wrong password returns 401 with a single generic message (no field disclosure)", async () => {
    const { email } = await seedUser("active");
    const res = await getAgent().post("/api/v1/auth/login").send({ email, password: "wrong-password-1" });
    expect(res.status).toBe(401);
    expect(res.body.error.code).toBe("INVALID_CREDENTIALS");
    expect(res.body.error.message).toBe("Invalid email or password");
    // No "fields" key — generic message must not reveal which field was wrong.
    expect(res.body.error.fields).toBeUndefined();
  });

  it("unknown email returns 401 with the same generic message (no enumeration)", async () => {
    const res = await getAgent()
      .post("/api/v1/auth/login")
      .send({ email: "nobody_" + Date.now() + "@nowhere.io", password: "anypassword1" });
    expect(res.status).toBe(401);
    expect(res.body.error.code).toBe("INVALID_CREDENTIALS");
    expect(res.body.error.message).toBe("Invalid email or password");
  });

  it.each(["suspended", "banned", "pending"] as const)(
    "non-active status (%s) returns 403 with 'not currently available'",
    async (status) => {
      const { email, password } = await seedUser(status);
      const res = await getAgent().post("/api/v1/auth/login").send({ email, password });
      expect(res.status).toBe(403);
      expect(res.body.error.code).toBe("ACCOUNT_NOT_ACTIVE");
      expect(res.body.error.message).toBe("Your account is not currently available");
    },
  );
});
