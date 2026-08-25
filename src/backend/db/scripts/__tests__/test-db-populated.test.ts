import { describe, it, expect, beforeAll } from "vitest";
import { env } from "#backend/env";
import { resetPopulatedTestDatabase } from "../test-db-populated-reset.js";
import { createTestDbClient } from "../test-db-provision.js";
import { userAccounts, profiles } from "../../schema/users.js";
import { posts, comments, reactions, reports } from "../../schema/interactions.js";
import { hashtags, postHashtags } from "../../schema/hashtags.js";
import { count, isNotNull } from "drizzle-orm";

describe("Populated State Test Database (foz_test_populated)", () => {
  beforeAll(async () => {
    await resetPopulatedTestDatabase();
  });

  it("should contain 52 users (1 admin, 1 moderator, 50 standard users) with profiles", async () => {
    const { db, pgClient } = createTestDbClient(env.TEST_POPULATED_DATABASE_URL);
    try {
      const users = await db.select().from(userAccounts);
      expect(users.length).toBe(52);

      const userProfiles = await db.select().from(profiles);
      expect(userProfiles.length).toBe(52);

      const admin = users.find((u) => u.email === "admin@admin.foz");
      expect(admin).toBeDefined();
      expect(admin?.role).toBe("administrator");

      const mod = users.find((u) => u.email === "mod@mod.foz");
      expect(mod).toBeDefined();
      expect(mod?.role).toBe("moderator");

      // Verify standard user naming convention
      const standardUsers = users.filter((u) => u.role === "standard");
      expect(standardUsers.length).toBe(50);
      expect(standardUsers.some((u) => u.email === "user1@foz.test")).toBe(true);
      expect(standardUsers.some((u) => u.email === "user50@foz.test")).toBe(true);
    } finally {
      await pgClient.end();
    }
  });

  it("should contain at least 100 posts with reposts and hashtags", async () => {
    const { db, pgClient } = createTestDbClient(env.TEST_POPULATED_DATABASE_URL);
    try {
      const [postCount] = await db.select({ val: count() }).from(posts);
      expect(postCount!.val).toBeGreaterThanOrEqual(100);

      const [repostCount] = await db
        .select({ val: count() })
        .from(posts)
        .where(isNotNull(posts.repostOfId));
      expect(repostCount!.val).toBeGreaterThan(0);

      const [hashtagCount] = await db.select({ val: count() }).from(hashtags);
      expect(hashtagCount!.val).toBeGreaterThanOrEqual(5);

      const allHashtags = await db.select().from(hashtags);
      expect(allHashtags.every((h) => !h.displayName.startsWith("#"))).toBe(true);

      const [postHashtagCount] = await db.select({ val: count() }).from(postHashtags);
      expect(postHashtagCount!.val).toBeGreaterThan(0);
    } finally {
      await pgClient.end();
    }
  });

  it("should contain threaded comments, replies, reactions, and reports", async () => {
    const { db, pgClient } = createTestDbClient(env.TEST_POPULATED_DATABASE_URL);
    try {
      const [commentCount] = await db.select({ val: count() }).from(comments);
      expect(commentCount!.val).toBeGreaterThanOrEqual(50);

      const [nestedReplyCount] = await db
        .select({ val: count() })
        .from(comments)
        .where(isNotNull(comments.parentCommentId));
      expect(nestedReplyCount!.val).toBeGreaterThan(0);

      const [reactionCount] = await db.select({ val: count() }).from(reactions);
      expect(reactionCount!.val).toBeGreaterThanOrEqual(50);

      const [reportCount] = await db.select({ val: count() }).from(reports);
      expect(reportCount!.val).toBeGreaterThanOrEqual(5);
    } finally {
      await pgClient.end();
    }
  });
});
