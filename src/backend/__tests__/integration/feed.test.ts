import { describe, it, expect, beforeAll, afterAll, beforeEach } from "vitest";
import { db } from "#backend/db/client.js";
import { userAccounts } from "#backend/db/schema/users.js";
import { posts, reactions, comments } from "#backend/db/schema/interactions.js";
import { eq } from "drizzle-orm";
import { listForYouFeed, listPopularFeed } from "#backend/services/interactions/posts.js";
import { listPosts } from "#backend/db/repositories/interactions.js";

// Helper to create a user
async function createUser(email: string) {
  const bcrypt = await import("bcrypt");
  const [user] = await db
    .insert(userAccounts)
    .values({
      email,
      passwordHash: await bcrypt.hash("password123", 1),
      status: "active",
      role: "standard",
    })
    .returning();
  return user!;
}

// Helper to create a post
async function createPost(authorId: string, content: string, minutesAgo = 0) {
  const [post] = await db
    .insert(posts)
    .values({
      authorId,
      content,
      visibilityState: "public",
      lifecycleState: "active",
      createdAt: new Date(Date.now() - minutesAgo * 60_000),
    })
    .returning();
  return post!;
}

// Helper to create a reaction
async function createReaction(userAccountId: string, targetId: string) {
  const [row] = await db
    .insert(reactions)
    .values({
      userAccountId,
      targetType: "post",
      targetId,
      reactionKind: "like",
    })
    .returning();
  return row!;
}

// Helper to create a comment
async function createComment(postId: string, authorId: string) {
  const [row] = await db
    .insert(comments)
    .values({
      postId,
      authorId,
      body: "Test comment",
      visibilityState: "public",
      lifecycleState: "active",
    })
    .returning();
  return row!;
}

describe("Feed generation", () => {
  let userA: typeof userAccounts.$inferSelect;
  let userB: typeof userAccounts.$inferSelect;
  let post1: typeof posts.$inferSelect;
  let post2: typeof posts.$inferSelect;
  let post3: typeof posts.$inferSelect;

  beforeAll(async () => {
    userA = await createUser("feed-test-a@test.com");
    userB = await createUser("feed-test-b@test.com");
  });

  beforeEach(async () => {
    // Clean up posts, reactions, comments
    await db.delete(reactions);
    await db.delete(comments);
    await db.delete(posts);
  });

  afterAll(async () => {
    await db.delete(reactions);
    await db.delete(comments);
    await db.delete(posts);
    await db.delete(userAccounts).where(eq(userAccounts.email, "feed-test-a@test.com"));
    await db.delete(userAccounts).where(eq(userAccounts.email, "feed-test-b@test.com"));
  });

  describe("listPosts ordering", () => {
    it("returns newest posts first (ORDER BY createdAt DESC)", async () => {
      const oldPost = await createPost(userA.id, "old post", 60);
      const newPost = await createPost(userA.id, "new post", 0);

      const result = await listPosts();
      expect(result[0]!.id).toBe(newPost.id);
      expect(result[result.length - 1]!.id).toBe(oldPost.id);
    });
  });

  describe("listPopularFeed", () => {
    it("ranks posts by engagement", async () => {
      const popularPost = await createPost(userA.id, "popular", 60);
      const unpopularPost = await createPost(userA.id, "unpopular", 5);

      // Give popularPost heavy engagement
      await createReaction(userA.id, popularPost.id);
      await createReaction(userB.id, popularPost.id);
      await createComment(popularPost.id, userA.id);
      await createComment(popularPost.id, userB.id);

      const result = await listPopularFeed(10);
      expect(result.items.length).toBe(2);
      // Popular post should rank higher despite being older
      expect(result.items[0]!.id).toBe(popularPost.id);
    });

    it("returns empty for no posts", async () => {
      const result = await listPopularFeed(10);
      expect(result.items).toEqual([]);
    });
  });

  describe("listForYouFeed", () => {
    it("ranks posts by affinity (viewer interacted with author)", async () => {
      const authorPost = await createPost(userA.id, "from author A", 60);
      const otherPost = await createPost(userB.id, "from author B", 10);

      // Viewer (userB) interacted with userA's content
      await createReaction(userB.id, authorPost.id);

      const result = await listForYouFeed(userB.id, 10);
      expect(result.items.length).toBe(2);
      // Post from author A should rank higher due to affinity
      expect(result.items[0]!.authorId).toBe(userA.id);
    });

    it("falls back to popularity on cold start (no interactions)", async () => {
      const popularPost = await createPost(userA.id, "popular", 30);
      const unpopularPost = await createPost(userB.id, "unpopular", 5);

      // Give popularPost heavy engagement
      await createReaction(userA.id, popularPost.id);
      await createReaction(userB.id, popularPost.id);
      await createComment(popularPost.id, userA.id);
      await createComment(popularPost.id, userB.id);

      // userB has no interactions → cold start
      const result = await listForYouFeed(userB.id, 10);
      expect(result.items.length).toBe(2);
      // Popular post should rank higher
      expect(result.items[0]!.id).toBe(popularPost.id);
    });

    it("supports cursor pagination", async () => {
      await createPost(userA.id, "post 1", 30);
      await createPost(userA.id, "post 2", 20);
      await createPost(userA.id, "post 3", 10);

      const firstPage = await listForYouFeed(userA.id, 2);
      expect(firstPage.items.length).toBe(2);
      expect(firstPage.nextCursor).toBeTruthy();

      const secondPage = await listForYouFeed(userA.id, 2, firstPage.nextCursor!);
      expect(secondPage.items.length).toBe(1);
    });
  });

  describe("guest feed", () => {
    it("listPopularFeed works without viewerId (guest)", async () => {
      await createPost(userA.id, "post 1", 10);
      await createPost(userA.id, "post 2", 5);

      const result = await listPopularFeed(10);
      expect(result.items.length).toBe(2);
      // Should return posts ordered by recency (no affinity for guests)
      expect(result.items[0]!.content).toBe("post 2");
    });
  });

  describe("500ms NFR", () => {
    it("listForYouFeed responds within 500ms with 100 posts", async () => {
      // Insert 100 posts
      const insertPromises = [];
      for (let i = 0; i < 100; i++) {
        insertPromises.push(createPost(userA.id, `post ${i}`, i));
      }
      await Promise.all(insertPromises);

      // Add some interactions
      const allPosts = await listPosts();
      for (let i = 0; i < 10; i++) {
        await createReaction(userB.id, allPosts[i]!.id);
      }

      const start = Date.now();
      await listForYouFeed(userB.id, 20);
      const elapsed = Date.now() - start;

      expect(elapsed).toBeLessThan(500);
    });
  });
});
