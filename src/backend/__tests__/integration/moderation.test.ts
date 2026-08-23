import { describe, it, expect, beforeAll, afterAll } from "vitest";
import { getAgent, clearDb } from "./auth.setup.js";
import { db } from "#backend/db/client.js";
import { userAccounts, profiles, reports } from "#backend/db/schema/index.js";
import { hash } from "bcrypt";
import jwt from "jsonwebtoken";
import { env } from "#backend/env.js";
import { randomUUID } from "node:crypto";

describe("Moderation API", () => {
  const agent = getAgent();
  let stdToken: string;
  let modToken: string;
  let mod2Token: string;
  let stdUser: typeof userAccounts.$inferSelect;
  let modUser: typeof userAccounts.$inferSelect;
  let mod2User: typeof userAccounts.$inferSelect;
  let openReportId: string;

  beforeAll(async () => {
    await clearDb();

    // Create a standard user
    const p1 = await hash("pass123", 10);
    const [insertedStdUser] = await db.insert(userAccounts).values({
      email: "std@example.com",
      username: "std_user",
      passwordHash: p1,
      role: "standard",
      status: "active",
    }).returning();
    stdUser = insertedStdUser!;
    await db.insert(profiles).values({ userAccountId: stdUser.id, displayName: "Standard User" });

    // Create a moderator user
    const p2 = await hash("pass123", 10);
    const [insertedModUser] = await db.insert(userAccounts).values({
      email: "mod@example.com",
      username: "mod_user",
      passwordHash: p2,
      role: "moderator",
      status: "active",
    }).returning();
    modUser = insertedModUser!;
    await db.insert(profiles).values({ userAccountId: modUser.id, displayName: "Moderator User" });

    const [insertedMod2User] = await db.insert(userAccounts).values({
      email: "mod2@example.com",
      username: "mod2_user",
      passwordHash: p2,
      role: "moderator",
      status: "active",
    }).returning();
    mod2User = insertedMod2User!;
    await db.insert(profiles).values({ userAccountId: mod2User.id, displayName: "Moderator 2" });

    stdToken = jwt.sign({ sub: stdUser.id }, env.JWT_ACCESS_SECRET, { expiresIn: "1h" });
    modToken = jwt.sign({ sub: modUser.id }, env.JWT_ACCESS_SECRET, { expiresIn: "1h" });
    mod2Token = jwt.sign({ sub: mod2User.id }, env.JWT_ACCESS_SECRET, { expiresIn: "1h" });

    // Insert some mock reports
    const [r1] = await db.insert(reports).values({
      reporterId: stdUser.id,
      targetType: "post",
      targetId: randomUUID(),
      reasonType: "spam",
      details: "This is spam",
      status: "open",
    }).returning();
    openReportId = r1!.id;

    await db.insert(reports).values({
      reporterId: stdUser.id,
      targetType: "comment",
      targetId: randomUUID(),
      reasonType: "harassment",
      status: "dismissed",
    });
  });

  afterAll(async () => {
    await clearDb();
  });

  it("should deny access to standard users", async () => {
    const res = await agent.get("/api/v1/moderation/metrics").set("Authorization", `Bearer ${stdToken}`);
    expect(res.status).toBe(403);
    expect(res.body.error.code).toBe("FORBIDDEN");
  });

  it("should allow access to moderators and return metrics", async () => {
    const res = await agent.get("/api/v1/moderation/metrics").set("Authorization", `Bearer ${modToken}`);
    expect(res.status).toBe(200);
    expect(res.body.totalReports).toBe(2);
    expect(res.body.pendingReview).toBe(1);
  });

  it("should return the reports queue", async () => {
    const res = await agent.get("/api/v1/moderation/reports").set("Authorization", `Bearer ${modToken}`);
    expect(res.status).toBe(200);
    expect(res.body.reports.length).toBe(2);
    expect(res.body.reports[0]).toHaveProperty("reporter");
    expect(res.body.reports[0].reporter.displayName).toBe("Standard User");
  });

  it("should filter the reports queue by status", async () => {
    const res = await agent.get("/api/v1/moderation/reports?status=open").set("Authorization", `Bearer ${modToken}`);
    expect(res.status).toBe(200);
    expect(res.body.reports.length).toBe(1);
    expect(res.body.reports[0].status).toBe("open");
  });

  it("should update report status", async () => {
    const res = await agent.patch(`/api/v1/moderation/reports/${openReportId}/status`)
      .set("Authorization", `Bearer ${modToken}`)
      .send({ status: "escalated", notes: "Escalating to admin" });
    
    expect(res.status).toBe(200);
    expect(res.body.status).toBe("escalated");

    // Verify it changed in metrics
    const metricsRes = await agent.get("/api/v1/moderation/metrics").set("Authorization", `Bearer ${modToken}`);
    expect(metricsRes.body.pendingReview).toBe(0); // 0 open reports now
  });
});
