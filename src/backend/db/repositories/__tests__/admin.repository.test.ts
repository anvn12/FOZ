import { describe, it, expect, beforeAll, afterAll, beforeEach } from "vitest";
import { clearDb } from "#backend/__tests__/integration/auth.setup.js";
import { db } from "#backend/db/client.js";
import { userAccounts, profiles, posts, comments, reports } from "#backend/db/schema/index.js";
import * as adminRepo from "../admin.js";
import { hash } from "bcrypt";
import { randomUUID } from "node:crypto";

describe("Admin Database Repository Tests (db/repositories/admin.ts)", () => {
  let adminUser: typeof userAccounts.$inferSelect;
  let stdUser: typeof userAccounts.$inferSelect;

  beforeAll(async () => {
    await clearDb();
  });

  afterAll(async () => {
    await clearDb();
  });

  beforeEach(async () => {
    await clearDb();

    // Create an Admin User
    const p1 = await hash("pass123", 10);
    const [u1] = await db
      .insert(userAccounts)
      .values({
        email: "admin@foz.dev",
        username: "admin_test",
        passwordHash: p1,
        role: "administrator",
        status: "active",
      })
      .returning();
    adminUser = u1!;
    await db.insert(profiles).values({ userAccountId: adminUser.id, displayName: "System Admin" });

    // Create a Standard User
    const p2 = await hash("pass123", 10);
    const [u2] = await db
      .insert(userAccounts)
      .values({
        email: "user@foz.dev",
        username: "user_test",
        passwordHash: p2,
        role: "standard",
        status: "active",
      })
      .returning();
    stdUser = u2!;
    await db.insert(profiles).values({ userAccountId: stdUser.id, displayName: "Standard Member" });
  });

  it("createAuditLog and getAuditLogs should record and query logs", async () => {
    await adminRepo.createAuditLog({
      actorId: adminUser.id,
      actorName: "admin@foz.dev",
      actorRole: "administrator",
      actionType: "ROLE_CHANGE",
      targetType: "USER",
      targetId: stdUser.id,
      rationale: "Promoted to moderator for community help",
    });

    const logs = await adminRepo.getAuditLogs({ page: 1, limit: 10 });
    expect(logs.total).toBe(1);
    expect(logs.items[0]?.actionType).toBe("ROLE_CHANGE");
    expect(logs.items[0]?.actorName).toBe("admin@foz.dev");
    expect(logs.items[0]?.rationale).toBe("Promoted to moderator for community help");
  });

  it("getAdminMetrics should return accurate live database counts", async () => {
    // Add a moderator
    await db.insert(userAccounts).values({
      email: "mod@foz.dev",
      username: "mod_test",
      passwordHash: "hash",
      role: "moderator",
      status: "active",
    });

    // Add an open report
    await db.insert(reports).values({
      reporterId: stdUser.id,
      targetType: "post",
      targetId: randomUUID(),
      reasonType: "spam",
      details: "Spam message",
      status: "open",
    });

    // Add a post for telemetry
    await db.insert(posts).values({
      authorId: stdUser.id,
      content: "Hello FOZ community!",
      visibilityState: "public",
      lifecycleState: "active",
    });

    const metrics = await adminRepo.getAdminMetrics();
    expect(metrics.totalUsers).toBe(3); // admin, standard, mod
    expect(metrics.activeModerators).toBe(1);
    expect(metrics.pendingEscalations).toBe(1);
    expect(metrics.dailyActivity).toHaveLength(7);
  });

  it("listUsers and countAdministrators should return paginated users and admin counts", async () => {
    const list = await adminRepo.listUsers({ page: 1, limit: 10, query: "Standard" });
    expect(list.total).toBe(1);
    expect(list.items[0]?.email).toBe("user@foz.dev");

    const adminCount = await adminRepo.countAdministrators();
    expect(adminCount).toBe(1);
  });

  it("updateUserRole should change user role", async () => {
    const updated = await adminRepo.updateUserRole(stdUser.id, "moderator");
    expect(updated?.role).toBe("moderator");
  });

  it("deleteUserAccountAndReattribute should clean up foreign keys and remove user", async () => {
    // Create post and comment for stdUser
    const [p] = await db
      .insert(posts)
      .values({
        authorId: stdUser.id,
        content: "Post to delete",
        visibilityState: "public",
        lifecycleState: "active",
      })
      .returning();

    await db.insert(comments).values({
      postId: p!.id,
      authorId: stdUser.id,
      body: "Comment to delete",
      visibilityState: "public",
      lifecycleState: "active",
    });

    const deleted = await adminRepo.deleteUserAccountAndReattribute(stdUser.id);
    expect(deleted?.id).toBe(stdUser.id);

    const remaining = await adminRepo.listUsers({ page: 1, limit: 10 });
    expect(remaining.total).toBe(1); // Only admin left
  });

  it("Forum Category Management CRUD should function cleanly", async () => {
    const created = await adminRepo.createForumCategory({
      name: "Tech Discussions",
      slug: "tech-discussions",
      description: "Technology news and chat",
      displayOrder: 1,
      allowNewPosts: true,
    });
    expect(created.name).toBe("Tech Discussions");

    const categories = await adminRepo.getForumCategories();
    expect(categories.length).toBeGreaterThanOrEqual(1);

    const updated = await adminRepo.updateForumCategory(created.id, {
      name: "Technology Hub",
      slug: "technology-hub",
    });
    expect(updated?.name).toBe("Technology Hub");

    const deleted = await adminRepo.deleteCategoryAndReassignThreads(created.id, "other-cat-id");
    expect(deleted?.id).toBe(created.id);
  });

  it("System Settings CRUD should fetch and update settings", async () => {
    const updated = await adminRepo.updateSystemSetting("site_notice", "Welcome to FOZ!", adminUser.id);
    expect(updated?.key).toBe("site_notice");
    expect(updated?.value).toBe("Welcome to FOZ!");

    const settings = await adminRepo.getSystemSettings();
    const found = settings.find((s) => s.key === "site_notice");
    expect(found?.value).toBe("Welcome to FOZ!");
  });
});
