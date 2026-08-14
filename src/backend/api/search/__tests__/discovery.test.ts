import { describe, it, expect, beforeEach } from "vitest";
import { sql } from "drizzle-orm";
import { getAgent, clearDb } from "../../../__tests__/integration/auth.setup.js";
import { uniqueEmail, uniqueUsername, uniquePassword } from "../../../__tests__/fixtures/users.js";
import { db } from "#backend/db/client.js";

async function registerUserWithDisplayName(displayName: string) {
  const res = await getAgent()
    .post("/api/v1/auth/register")
    .send({ email: uniqueEmail(), username: uniqueUsername(), password: uniquePassword() });
  if (res.status !== 201) throw new Error(`register failed: ${res.status} ${JSON.stringify(res.body)}`);
  await db.execute(sql`
    UPDATE profiles SET display_name = ${displayName} WHERE user_account_id = ${res.body.user.id}
  `);
  return { userId: res.body.user.id as string, email: res.body.user.email as string };
}

async function insertPost(authorId: string, content: string) {
  const rows = (await db.execute(sql`
    INSERT INTO posts (author_id, content, visibility_state, lifecycle_state)
    VALUES (${authorId}, ${content}, 'public', 'active')
    RETURNING id
  `)) as Array<{ id: string }>;
  return rows[0]!.id;
}

async function insertRepost(authorId: string, repostOfId: string) {
  const rows = (await db.execute(sql`
    INSERT INTO posts (author_id, content, repost_of_id, visibility_state, lifecycle_state)
    VALUES (${authorId}, '', ${repostOfId}, 'public', 'active')
    RETURNING id
  `)) as Array<{ id: string }>;
  return rows[0]!.id;
}

async function insertAttachment(postId: string, fileUrl: string) {
  await db.execute(sql`
    INSERT INTO post_attachments (post_id, file_url, file_type, file_size)
    VALUES (${postId}, ${fileUrl}, 'image/png', 1024)
  `);
}

describe("GET /api/v1/search/discovery", () => {
  beforeEach(async () => {
    await clearDb();
  });

  it("returns search discovery structure with topics, creators, and discussions", async () => {
    const { userId } = await registerUserWithDisplayName("CreatorOne");
    await insertPost(userId, "Hello world post content");

    const res = await getAgent().get("/api/v1/search/discovery");

    expect(res.status).toBe(200);
    expect(res.body).toHaveProperty("topics");
    expect(res.body).toHaveProperty("creators");
    expect(res.body).toHaveProperty("discussions");

    expect(Array.isArray(res.body.topics)).toBe(true);
    expect(Array.isArray(res.body.creators)).toBe(true);
    expect(Array.isArray(res.body.discussions)).toBe(true);

    // Verify creators includes CreatorOne
    const creatorNames = res.body.creators.map((c: { displayName: string }) => c.displayName);
    expect(creatorNames).toContain("CreatorOne");

    // Verify discussions includes the post content
    const discussionContents = res.body.discussions.map((d: { content: string }) => d.content);
    expect(discussionContents).toContain("Hello world post content");
  });

  it("excludes reposts from trending discussions", async () => {
    const { userId } = await registerUserWithDisplayName("RepostAuthor");
    const postId = await insertPost(userId, "Original discussion content");
    await insertRepost(userId, postId);

    const res = await getAgent().get("/api/v1/search/discovery");

    expect(res.status).toBe(200);
    const discussions = res.body.discussions as Array<{ content: string; repostCount: number }>;
    expect(discussions).toHaveLength(1);
    expect(discussions[0]!.content).toBe("Original discussion content");
    expect(discussions[0]!.repostCount).toBe(1);
  });

  it("includes post attachments in trending discussions", async () => {
    const { userId } = await registerUserWithDisplayName("AttachmentAuthor");
    const postId = await insertPost(userId, "Post with an image");
    await insertAttachment(postId, "https://cdn.example.com/photo.png");

    const res = await getAgent().get("/api/v1/search/discovery");

    expect(res.status).toBe(200);
    const discussions = res.body.discussions as Array<{
      content: string;
      attachments: Array<{ fileUrl: string; fileType: string }>;
    }>;
    expect(discussions).toHaveLength(1);
    expect(discussions[0]!.attachments).toEqual([
      expect.objectContaining({
        fileUrl: "https://cdn.example.com/photo.png",
        fileType: "image/png",
      }),
    ]);
  });

  it("returns real trending topics extracted from posts with hashtags", async () => {
    const { userId } = await registerUserWithDisplayName("HashtagAuthor");
    const postId = await insertPost(userId, "Testing #FOZ and #RealData in search page");
    const { extractHashtagsAndSync } = await import("#backend/db/repositories/hashtags.js");
    await extractHashtagsAndSync(postId, "Testing #FOZ and #RealData in search page");

    const res = await getAgent().get("/api/v1/search/discovery");

    expect(res.status).toBe(200);
    const topicTags = res.body.topics.map((t: { tag: string }) => t.tag);
    expect(topicTags).toContain("#FOZ");
    expect(topicTags).toContain("#RealData");
  });

  it("allows searching users with wildcard query to list creators", async () => {
    await registerUserWithDisplayName("AliceTest");
    await registerUserWithDisplayName("BobTest");

    const res = await getAgent().get("/api/v1/search").query({ q: "%", type: "users" });

    expect(res.status).toBe(200);
    expect(res.body.items.length).toBeGreaterThanOrEqual(2);
    const names = res.body.items.map((i: { displayName: string }) => i.displayName);
    expect(names).toContain("AliceTest");
    expect(names).toContain("BobTest");
  });

  it("indicates liked status for discussions when authenticated viewer has liked the post", async () => {
    const regRes = await getAgent()
      .post("/api/v1/auth/register")
      .send({ email: uniqueEmail(), username: uniqueUsername(), password: uniquePassword() });
    expect(regRes.status).toBe(201);
    const userId = regRes.body.user.id;
    const accessToken = regRes.body.accessToken;

    const postId = await insertPost(userId, "Post to be liked by viewer");
    await db.execute(sql`
      INSERT INTO reactions (user_account_id, target_type, target_id, reaction_kind)
      VALUES (${userId}, 'post', ${postId}, 'like')
    `);

    const res = await getAgent()
      .get("/api/v1/search/discovery")
      .set("Authorization", `Bearer ${accessToken}`);

    expect(res.status).toBe(200);
    const discussions = res.body.discussions as Array<{ id: string; liked: boolean }>;
    const target = discussions.find((d) => d.id === postId);
    expect(target?.liked).toBe(true);
  });
});
