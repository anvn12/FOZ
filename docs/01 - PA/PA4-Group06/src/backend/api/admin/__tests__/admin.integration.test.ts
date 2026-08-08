import { describe, it, expect, beforeAll, afterAll } from "vitest";
import { getAgent, clearDb } from "#backend/__tests__/integration/auth.setup.js";
import { db } from "#backend/db/client.js";
import { userAccounts, profiles, posts, reports } from "#backend/db/schema/index.js";
import { hash } from "bcrypt";
import { signAccessToken } from "#backend/lib/jwt.js";

describe("Administrator End-to-End API Integration Suite (src/backend/api/admin/routes.ts)", () => {
  const agent = getAgent();
  let adminToken: string;
  let stdToken: string;
  let adminUser: typeof userAccounts.$inferSelect;
  let stdUser: typeof userAccounts.$inferSelect;
  let testPost: typeof posts.$inferSelect;

  beforeAll(async () => {
    await clearDb();

    // Create Admin User
    const p1 = await hash("Passsword123!", 10);
    const [u1] = await db
      .insert(userAccounts)
      .values({
        email: "admin@foz.dev",
        username: "admin_user",
        passwordHash: p1,
        role: "administrator",
        status: "active",
      })
      .returning();
    adminUser = u1!;
    await db.insert(profiles).values({ userAccountId: adminUser.id, displayName: "Platform Admin" });

    // Create Standard User
    const p2 = await hash("Passsword123!", 10);
    const [u2] = await db
      .insert(userAccounts)
      .values({
        email: "stduser@foz.dev",
        username: "std_user",
        passwordHash: p2,
        role: "standard",
        status: "active",
      })
      .returning();
    stdUser = u2!;
    await db.insert(profiles).values({ userAccountId: stdUser.id, displayName: "Standard User" });

    // Generate valid JWT Tokens
    adminToken = signAccessToken({ sub: adminUser.id, role: adminUser.role, status: adminUser.status });
    stdToken = signAccessToken({ sub: stdUser.id, role: stdUser.role, status: stdUser.status });

    // Create test post and report
    const [p] = await db
      .insert(posts)
      .values({
        authorId: stdUser.id,
        content: "Flagged test post for admin review",
        visibilityState: "public",
        lifecycleState: "active",
      })
      .returning();
    testPost = p!;

    await db.insert(reports).values({
      reporterId: stdUser.id,
      targetType: "post",
      targetId: testPost.id,
      reasonType: "spam",
      details: "Spam content detected",
      status: "escalated",
    });
  });

  afterAll(async () => {
    await clearDb();
  });

  describe("Role-Based Authorization & Gating", () => {
    it("should return 401 when requesting admin endpoints without token", async () => {
      const res = await agent.get("/api/v1/admin/metrics");
      expect(res.status).toBe(401);
    });

    it("should return 403 when standard user attempts admin access", async () => {
      const res = await agent.get("/api/v1/admin/metrics").set("Authorization", `Bearer ${stdToken}`);
      expect(res.status).toBe(403);
      expect(res.body.error.code).toBe("FORBIDDEN");
    });

    it("should return 200 for authenticated Administrator", async () => {
      const res = await agent.get("/api/v1/admin/metrics").set("Authorization", `Bearer ${adminToken}`);
      expect(res.status).toBe(200);
      expect(res.body).toHaveProperty("totalUsers");
      expect(res.body).toHaveProperty("dailyActivity");
    });
  });

  describe("User Management & Role Assignment", () => {
    it("GET /api/v1/admin/users returns list of users", async () => {
      const res = await agent.get("/api/v1/admin/users").set("Authorization", `Bearer ${adminToken}`);
      expect(res.status).toBe(200);
      expect(res.body.items.length).toBeGreaterThanOrEqual(2);
    });

    it("PUT /api/v1/admin/users/:userId/role assigns user role", async () => {
      const res = await agent
        .put(`/api/v1/admin/users/${stdUser.id}/role`)
        .set("Authorization", `Bearer ${adminToken}`)
        .send({
          role: "moderator",
          rationale: "Promoted standard user to moderator",
        });

      expect(res.status).toBe(200);
      expect(res.body.user.role).toBe("moderator");
    });

    it("DELETE /api/v1/admin/users/:userId prevents deleting sole administrator", async () => {
      const res = await agent
        .delete(`/api/v1/admin/users/${adminUser.id}`)
        .set("Authorization", `Bearer ${adminToken}`)
        .send({
          rationale: "Trying to remove sole admin",
        });

      expect(res.status).toBe(400);
      expect(res.body.error.message).toContain("sole Administrator");
    });
  });

  describe("Escalated Moderation & Content Removal", () => {
    it("GET /api/v1/admin/reports returns escalated reports queue", async () => {
      const res = await agent.get("/api/v1/admin/reports").set("Authorization", `Bearer ${adminToken}`);
      expect(res.status).toBe(200);
      expect(res.body.reports.length).toBeGreaterThanOrEqual(1);
    });

    it("DELETE /api/v1/admin/content/:type/:id removes content instantly with rationale", async () => {
      const res = await agent
        .delete(`/api/v1/admin/content/post/${testPost.id}`)
        .set("Authorization", `Bearer ${adminToken}`)
        .send({
          rationale: "Removing prohibited spam content",
        });

      expect(res.status).toBe(200);
      expect(res.body.message).toBe("Content deleted successfully");
    });
  });

  describe("Category Management & System Settings", () => {
    it("POST /api/v1/admin/categories creates new category", async () => {
      const res = await agent
        .post("/api/v1/admin/categories")
        .set("Authorization", `Bearer ${adminToken}`)
        .send({
          name: "New Category Integration Test",
          slug: "new-category-integration-test",
          description: "Official forum updates and test category",
          displayOrder: 99,
          allowNewPosts: true,
        });

      expect(res.status).toBe(201);
      expect(res.body.category.name).toBe("New Category Integration Test");
    });

    it("GET /api/v1/admin/categories lists categories", async () => {
      const res = await agent.get("/api/v1/admin/categories").set("Authorization", `Bearer ${adminToken}`);
      expect(res.status).toBe(200);
      expect(res.body.categories.length).toBeGreaterThanOrEqual(1);
    });

    it("PUT /api/v1/admin/settings updates system settings", async () => {
      const res = await agent
        .put("/api/v1/admin/settings")
        .set("Authorization", `Bearer ${adminToken}`)
        .send({
          key: "registration_open",
          value: "true",
          rationale: "Enabling user registrations",
        });

      expect(res.status).toBe(200);
      expect(res.body.setting.key).toBe("registration_open");
    });

    it("GET /api/v1/admin/audit-logs lists logged administrative actions", async () => {
      const res = await agent.get("/api/v1/admin/audit-logs").set("Authorization", `Bearer ${adminToken}`);
      expect(res.status).toBe(200);
      expect(res.body.items.length).toBeGreaterThanOrEqual(1);
    });
  });
});
