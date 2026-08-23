import { describe, it, expect, beforeAll } from "vitest";
import { getAgent } from "./auth.setup.js";
import { db } from "#backend/db/client.js";
import { userAccounts } from "#backend/db/schema/users.js";
import { eq } from "drizzle-orm";

async function registerAndGetToken(email = "user@example.com", role = "standard"): Promise<{ accessToken: string; userId: string }> {
  const parts = email.split("@");
  const username = (parts[0] ?? "user").replace(/[^a-z0-9._]/gi, "_");
  const res = await getAgent()
    .post("/api/v1/auth/register")
    .send({ email, username, password: "password123" });
  
  if (!res.body?.user?.id) throw new Error(`Registration failed: ${JSON.stringify(res.body)}`);
  const userId = res.body.user.id as string;
  
  if (role !== "standard") {
    await db.update(userAccounts).set({ role: role as any }).where(eq(userAccounts.id, userId));
  }
  
  return {
    accessToken: res.body.accessToken,
    userId,
  };
}

describe("Admin Metrics (TC6)", () => {
  let adminToken: string;

  beforeAll(async () => {
    const admin = await registerAndGetToken("admin_metrics@test.com", "administrator");
    adminToken = admin.accessToken;
  });

  it("TC6: Calculates platform metrics (users, mods, reports, AI status) without 500 error", async () => {
    const res = await getAgent()
      .get("/api/v1/admin/metrics")
      .set("Authorization", `Bearer ${adminToken}`);
    
    expect(res.status).toBe(200);
  });
});
