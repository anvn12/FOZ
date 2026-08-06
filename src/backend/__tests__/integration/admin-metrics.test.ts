import { describe, it, expect, beforeAll } from "vitest";
import { getAgent } from "./auth.setup.js";
import { db } from "#backend/db/client.js";
import { userAccounts } from "#backend/db/schema/users.js";
import { eq } from "drizzle-orm";

async function registerAndGetToken(email = "user@example.com", role = "standard"): Promise<{ accessToken: string; userId: string }> {
  const res = await getAgent()
    .post("/api/v1/auth/register")
    .send({ email, password: "password123" });
  
  const userId = res.body.user.id;
  
  if (role !== "standard") {
    await db.update(userAccounts).set({ role: role as any }).where(eq(userAccounts.id, userId));
  }
  
  return {
    accessToken: res.body.accessToken,
    userId,
  };
}

describe("Admin Metrics", () => {
  let adminToken: string;

  beforeAll(async () => {
    const admin = await registerAndGetToken("admin_metrics@test.com", "administrator");
    adminToken = admin.accessToken;
  });

  it("should get metrics without 500 error", async () => {
    const res = await getAgent()
      .get("/api/v1/admin/metrics")
      .set("Authorization", `Bearer ${adminToken}`);
    
    console.log(res.status, res.body);
    expect(res.status).toBe(200);
  });
});
