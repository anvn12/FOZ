import { describe, it, expect, beforeAll, afterAll, beforeEach } from "vitest";
import { clearDb } from "#backend/__tests__/integration/auth.setup.js";
import { db } from "#backend/db/client.js";
import { userAccounts, posts, comments } from "#backend/db/schema/index.js";
import {
  getPostSummaryByPostId,
  upsertPostSummary,
  getSampledCommentsForSummary,
} from "#backend/db/repositories/post-summary.repository.js";
import { hash } from "bcrypt";

describe("Post Summary Repository Integration Tests (db/repositories/post-summary.repository.ts)", () => {
  let testUser: typeof userAccounts.$inferSelect;
  let testPost: typeof posts.$inferSelect;

  beforeAll(async () => {
    await clearDb();
  });

  afterAll(async () => {
    await clearDb();
  });

  beforeEach(async () => {
    await clearDb();

    // Create user
    const passwordHash = await hash("password123", 10);
    const [u] = await db
      .insert(userAccounts)
      .values({
        email: "summary_tester@foz.dev",
        username: "summary_tester",
        passwordHash,
        role: "standard",
        status: "active",
      })
      .returning();
    testUser = u!;

    // Create post
    const [p] = await db
      .insert(posts)
      .values({
        authorId: testUser.id,
        content: "Testing post summary repository database operations.",
        visibilityState: "public",
        lifecycleState: "active",
      })
      .returning();
    testPost = p!;
  });

  describe("getSampledCommentsForSummary", () => {
    it("Queries active comments from DB, filtering out soft-deleted and hidden comments", async () => {
      // 1. Valid active public comment
      const [cActive] = await db
        .insert(comments)
        .values({
          postId: testPost.id,
          authorId: testUser.id,
          body: "Active public comment",
          visibilityState: "public",
          lifecycleState: "active",
        })
        .returning();

      // 2. Soft-deleted comment (deletedAt is set)
      await db.insert(comments).values({
        postId: testPost.id,
        authorId: testUser.id,
        body: "Deleted comment that should be excluded",
        visibilityState: "public",
        lifecycleState: "active",
        deletedAt: new Date(),
      });

      // 3. Hidden comment (visibilityState is 'hidden')
      await db.insert(comments).values({
        postId: testPost.id,
        authorId: testUser.id,
        body: "Hidden comment that should be excluded",
        visibilityState: "hidden",
        lifecycleState: "active",
      });

      const sampled = await getSampledCommentsForSummary(testPost.id);

      expect(sampled).toHaveLength(1);
      expect(sampled[0]?.id).toBe(cActive!.id);
      expect(sampled[0]?.body).toBe("Active public comment");
    });
  });

  describe("upsertPostSummary & getPostSummaryByPostId", () => {
    it("Inserts a new summary record when none exists, and updates in-place when refreshed", async () => {
      // 1. Initial insert
      const inserted = await upsertPostSummary({
        postId: testPost.id,
        postSnapshot: "Initial post snapshot overview",
        keyHighlights: ["Initial highlight 1", "Initial highlight 2"],
        sentiment: "Supportive",
        commentCount: 2,
      });

      expect(inserted.id).toBeDefined();
      expect(inserted.postId).toBe(testPost.id);
      expect(inserted.postSnapshot).toBe("Initial post snapshot overview");
      expect(inserted.keyHighlights).toEqual(["Initial highlight 1", "Initial highlight 2"]);
      expect(inserted.sentiment).toBe("Supportive");
      expect(inserted.commentCount).toBe(2);

      // 2. Verify retrieval
      const found = await getPostSummaryByPostId(testPost.id);
      expect(found).toBeDefined();
      expect(found?.id).toBe(inserted.id);

      // 3. Refresh / Update in-place
      const updated = await upsertPostSummary({
        postId: testPost.id,
        postSnapshot: "Refreshed snapshot overview",
        keyHighlights: ["Updated highlight"],
        sentiment: "Constructive",
        commentCount: 5,
      });

      expect(updated.id).toBe(inserted.id); // Same record ID
      expect(updated.postSnapshot).toBe("Refreshed snapshot overview");
      expect(updated.keyHighlights).toEqual(["Updated highlight"]);
      expect(updated.sentiment).toBe("Constructive");
      expect(updated.commentCount).toBe(5);

      // 4. Verify retrieval reflects updated values
      const refetched = await getPostSummaryByPostId(testPost.id);
      expect(refetched?.postSnapshot).toBe("Refreshed snapshot overview");
    });

    it("Returns undefined when fetching summary for a post without a summary", async () => {
      const nonExistent = await getPostSummaryByPostId("00000000-0000-0000-0000-000000000000");
      expect(nonExistent).toBeUndefined();
    });
  });
});
