import { describe, it, expect, beforeAll, afterAll, beforeEach } from "vitest";
import { db } from "#backend/db/client.js";
import { userAccounts, profiles } from "#backend/db/schema/users.js";
import { posts, reactions, comments } from "#backend/db/schema/interactions.js";
import { eq } from "drizzle-orm";
import { listForYouFeed, listPopularFeed, listPostFeed, createRepost } from "#backend/services/interactions/posts.js";
import { listPosts } from "#backend/db/repositories/interactions.js";

// Helper to create a user
async function createUser(email: string) {
  const bcrypt = await import("bcrypt");
  const username = email.split("@")[0] + "_" + Math.random().toString(36).slice(2, 6);
  const [user] = await db
    .insert(userAccounts)
    .values({
      email,
      username,
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
    // Clean up posts, reactions, comments, profiles
    await db.delete(reactions);
    await db.delete(comments);
    await db.delete(posts);
    await db.delete(profiles);
  });

  afterAll(async () => {
    await db.delete(reactions);
    await db.delete(comments);
    await db.delete(posts);
    await db.delete(profiles);
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

    it("returns only the given author's posts when authorId is passed", async () => {
      await createPost(userA.id, "from A", 10);
      await createPost(userB.id, "from B", 5);

      const result = await listPosts(userA.id);
      expect(result.length).toBe(1);
      expect(result[0]!.authorId).toBe(userA.id);
    });
  });

  describe("listPostFeed (production 'latest' path, with enrichment)", () => {
    it("enriches posts with liked/reposted/commentCount/attachments for the real viewer-facing path", async () => {
      // TC9 originally only exercised the low-level `listPosts` repo query, which
      // never runs through the enrichment (`liked`, `reposted`, `attachments`) that
      // the real HTTP "latest" tab depends on via `listPostFeed` -> `enrichPostList`.
      const post = await createPost(userA.id, "enrich me", 10);
      await createReaction(userB.id, post.id);
      await createComment(post.id, userB.id);

      const [item] = await listPostFeed(userB.id);
      expect(item).toMatchObject({
        id: post.id,
        liked: true,
        reposted: false,
        commentCount: 1,
      });
      expect(item!.attachments).toEqual([]);
    });

    it("returns only the given author's posts when authorId is passed", async () => {
      await createPost(userA.id, "from A", 10);
      await createPost(userB.id, "from B", 5);

      const result = await listPostFeed(undefined, userA.id);
      expect(result.length).toBe(1);
      expect(result[0]!.authorId).toBe(userA.id);
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

    it("supports cursor pagination", async () => {
      // `listForYouFeed`'s cursor logic was already covered; `listPopularFeed` has
      // the identical pagination branch and had zero coverage of its own.
      await createPost(userA.id, "post 1", 30);
      await createPost(userA.id, "post 2", 20);
      await createPost(userA.id, "post 3", 10);

      const firstPage = await listPopularFeed(2);
      expect(firstPage.items.length).toBe(2);
      expect(firstPage.nextCursor).toBeTruthy();

      const secondPage = await listPopularFeed(2, firstPage.nextCursor!);
      expect(secondPage.items.length).toBe(1);
    });
  });

  describe("reposts in the ranked feed", () => {
    it("surfaces the original post's content with the reposter attached", async () => {
      const original = await createPost(userA.id, "original content", 60);
      await db.insert(profiles).values({
        userAccountId: userB.id,
        displayName: "Bee Reposter",
      });
      const repost = await createRepost(userB.id, original.id);

      const result = await listPopularFeed(10);
      // The repost surfaces as its own feed entry (repostId set), alongside the
      // original poster's own occurrence of the same content (no repostId).
      const repostItem = result.items.find(
        (i) => (i as { repostId?: string }).repostId === repost!.id,
      ) as (typeof result.items)[number] & {
        repostId?: string;
        repostedBy?: { id: string; displayName: string };
      };
      expect(repostItem).toBeDefined();
      expect(repostItem.content).toBe("original content");
      expect(repostItem.repostedBy).toMatchObject({
        id: userB.id,
        displayName: "Bee Reposter",
      });
    });

    it("silently drops a repost whose original post is no longer public", async () => {
      const original = await createPost(userA.id, "will be hidden", 60);
      await createRepost(userB.id, original.id);

      // Original becomes non-public after the repost was created.
      await db.update(posts).set({ visibilityState: "hidden" }).where(eq(posts.id, original.id));

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

  describe("listPopularFeed ranking with no interaction map", () => {
    it("ranks purely by engagement + recency when the interaction map is empty", async () => {
      // Renamed from "guest feed" / "works without viewerId (guest)": listPopularFeed
      // never accepts a viewerId at all, so this doesn't test guest identity or
      // routing — only that recency ordering holds with zero engagement difference.
      // The actual guest-vs-authenticated routing decision lives in the HTTP route
      // (see feed-routes.test.ts).
      await createPost(userA.id, "post 1", 10);
      await createPost(userA.id, "post 2", 5);

      const result = await listPopularFeed(10);
      expect(result.items.length).toBe(2);
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
