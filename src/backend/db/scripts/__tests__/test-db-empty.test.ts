import { describe, it, expect, beforeAll } from "vitest";
import { env } from "#backend/env";
import { resetEmptyTestDatabase } from "../test-db-empty-reset.js";
import { createTestDbClient } from "../test-db-provision.js";
import { userAccounts, profiles } from "../../schema/users.js";
import { posts, comments, reactions, reports } from "../../schema/interactions.js";
import { hashtags } from "../../schema/hashtags.js";
import { count } from "drizzle-orm";

describe("Empty State Test Database (foz_test_empty)", () => {
  beforeAll(async () => {
    await resetEmptyTestDatabase();
  });

  it("should contain exactly 2 system accounts (admin and moderator)", async () => {
    const { db, pgClient } = createTestDbClient(env.TEST_EMPTY_DATABASE_URL);
    try {
      const users = await db.select().from(userAccounts);
      expect(users).toHaveLength(2);

      const admin = users.find((u) => u.email === "admin@admin.foz");
      expect(admin).toBeDefined();
      expect(admin?.role).toBe("administrator");
      expect(admin?.status).toBe("active");

      const mod = users.find((u) => u.email === "mod@mod.foz");
      expect(mod).toBeDefined();
      expect(mod?.role).toBe("moderator");
      expect(mod?.status).toBe("active");

      const userProfiles = await db.select().from(profiles);
      expect(userProfiles).toHaveLength(2);
    } finally {
      await pgClient.end();
    }
  });

  it("should contain exactly zero posts, comments, reactions, reports, and hashtags", async () => {
    const { db, pgClient } = createTestDbClient(env.TEST_EMPTY_DATABASE_URL);
    try {
      const [postCount] = await db.select({ val: count() }).from(posts);
      const [commentCount] = await db.select({ val: count() }).from(comments);
      const [reactionCount] = await db.select({ val: count() }).from(reactions);
      const [reportCount] = await db.select({ val: count() }).from(reports);
      const [hashtagCount] = await db.select({ val: count() }).from(hashtags);

      expect(postCount!.val).toBe(0);
      expect(commentCount!.val).toBe(0);
      expect(reactionCount!.val).toBe(0);
      expect(reportCount!.val).toBe(0);
      expect(hashtagCount!.val).toBe(0);
    } finally {
      await pgClient.end();
    }
  });
});
