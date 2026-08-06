import { describe, it, expect, beforeAll, afterAll } from "vitest";
import { sql } from "drizzle-orm";
import { parseHashtagsFromText, extractHashtagsAndSync, getPostsByHashtag, getTrendingHashtags } from "#backend/db/repositories/hashtags.js";
import { db } from "#backend/db/client.js";
import { userAccounts } from "#backend/db/schema/users.js";
import { posts } from "#backend/db/schema/interactions.js";
import { hashtags, postHashtags } from "#backend/db/schema/hashtags.js";

describe("Hashtag Unit & Integration Tests", () => {
  it("parses hashtags from text correctly with punctuation trimming and deduplication", () => {
    const text = "Hello #FOZ! Welcome to #web3, #foz and #development_2026. Standalone # symbol.";
    const tags = parseHashtagsFromText(text);
    expect(tags).toEqual(["FOZ", "web3", "development_2026"]);
  });

  describe("Hashtag Repository Operations", () => {
    let testUserId: string;
    let testPostId: string;

    beforeAll(async () => {
      await db.execute(sql`
        CREATE TABLE IF NOT EXISTS hashtags (
          id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
          name TEXT UNIQUE NOT NULL,
          display_name TEXT NOT NULL,
          created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL
        );
      `);
      await db.execute(sql`
        CREATE TABLE IF NOT EXISTS post_hashtags (
          post_id UUID NOT NULL REFERENCES posts(id) ON DELETE CASCADE,
          hashtag_id UUID NOT NULL REFERENCES hashtags(id) ON DELETE CASCADE,
          PRIMARY KEY (post_id, hashtag_id)
        );
      `);

      // Clear tables
      await db.delete(postHashtags);
      await db.delete(hashtags);
      await db.delete(posts);

      const [user] = await db
        .insert(userAccounts)
        .values({
          email: "hashtag-tester@foz.app",
          passwordHash: "hash",
          role: "standard",
          status: "active",
        })
        .returning();
      if (!user) throw new Error("Failed to insert test user");
      testUserId = user.id;

      const [post] = await db
        .insert(posts)
        .values({
          authorId: testUserId,
          content: "Testing #LiveHashtag feature on #FOZ",
          visibilityState: "public",
          lifecycleState: "active",
        })
        .returning();
      if (!post) throw new Error("Failed to insert test post");
      testPostId = post.id;
    });

    afterAll(async () => {
      await db.delete(postHashtags);
      await db.delete(hashtags);
      await db.delete(posts);
      await db.delete(userAccounts);
    });

    it("extracts and syncs hashtags into database", async () => {
      await extractHashtagsAndSync(testPostId, "Testing #LiveHashtag feature on #FOZ");

      const dbHashtags = await db.select().from(hashtags);
      expect(dbHashtags.length).toBe(2);
      expect(dbHashtags.map((h) => h.name).sort()).toEqual(["foz", "livehashtag"]);

      const links = await db.select().from(postHashtags);
      expect(links.length).toBe(2);
    });

    it("retrieves posts by hashtag case-insensitively", async () => {
      const result = await getPostsByHashtag("livehashtag");
      expect(result.items.length).toBe(1);
      expect(result.items[0].id).toBe(testPostId);
    });

    it("computes 7-day trending hashtags", async () => {
      const trending = await getTrendingHashtags();
      expect(trending.length).toBeGreaterThanOrEqual(2);
      const tagNames = trending.map((t) => t.name);
      expect(tagNames).toContain("foz");
      expect(tagNames).toContain("livehashtag");
    });
  });
});
