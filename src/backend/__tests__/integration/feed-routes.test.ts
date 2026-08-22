import { describe, it, expect, beforeEach } from "vitest";
import { getAgent, clearDb } from "./auth.setup.js";
import { db } from "#backend/db/client.js";
import { posts } from "#backend/db/schema/interactions.js";

// GET /api/v1/posts (the feed endpoint the frontend actually calls) had zero
// HTTP-level tests before this review (see docs "Feed generation.md", §2 Category 3).
// listForYouFeed / listPopularFeed / listPostFeed themselves are already covered in
// feed.test.ts; these tests exercise the route wiring on top: query validation,
// the guest-vs-authenticated branch, and the authorId filter passed through.

async function registerAndGetToken(): Promise<{ accessToken: string; userId: string }> {
  const suffix = Math.random().toString(36).slice(2, 8);
  const res = await getAgent()
    .post("/api/v1/auth/register")
    .send({ email: `feedroute_${suffix}@test.local`, username: `feedroute_${suffix}`, password: "password123" });
  expect(res.status).toBe(201);
  return { accessToken: res.body.accessToken as string, userId: res.body.user.id as string };
}

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

describe("GET /api/v1/posts (feed route)", () => {
  beforeEach(async () => {
    await clearDb();
  });

  it("type=latest, guest — 200 with the chronological feed", async () => {
    const { userId } = await registerAndGetToken();
    await createPost(userId, "hello world", 5);

    const res = await getAgent().get("/api/v1/posts?type=latest");
    expect(res.status).toBe(200);
    expect(Array.isArray(res.body.items)).toBe(true);
    expect(res.body.items.length).toBe(1);
    expect(res.body.items[0].content).toBe("hello world");
  });

  it("type=for-you, guest — 200 with the popularity feed shape, no degraded flag", async () => {
    const { userId } = await registerAndGetToken();
    await createPost(userId, "hello world", 5);

    const res = await getAgent().get("/api/v1/posts?type=for-you");
    expect(res.status).toBe(200);
    expect(Array.isArray(res.body.items)).toBe(true);
    // This is the intended guest path (listPopularFeed), not a failure fallback.
    expect(res.body.degraded).toBeUndefined();
  });

  it("type=for-you, authenticated — 200 with items + nextCursor from listForYouFeed", async () => {
    const { accessToken, userId } = await registerAndGetToken();
    await createPost(userId, "hello world", 5);

    const res = await getAgent().get("/api/v1/posts?type=for-you").set("Authorization", `Bearer ${accessToken}`);
    expect(res.status).toBe(200);
    expect(Array.isArray(res.body.items)).toBe(true);
    expect(res.body).toHaveProperty("nextCursor");
  });

  it("invalid type — 400 INVALID_QUERY", async () => {
    const res = await getAgent().get("/api/v1/posts?type=bogus");
    expect(res.status).toBe(400);
    expect(res.body.error.code).toBe("INVALID_QUERY");
  });

  it("limit out of bounds — 400 for both 0 and 51", async () => {
    const tooLow = await getAgent().get("/api/v1/posts?type=latest&limit=0");
    expect(tooLow.status).toBe(400);
    expect(tooLow.body.error.code).toBe("INVALID_QUERY");

    const tooHigh = await getAgent().get("/api/v1/posts?type=latest&limit=51");
    expect(tooHigh.status).toBe(400);
    expect(tooHigh.body.error.code).toBe("INVALID_QUERY");
  });

  it("authorId filter — returns only that author's posts", async () => {
    const { userId: authorA } = await registerAndGetToken();
    const { userId: authorB } = await registerAndGetToken();
    await createPost(authorA, "from A", 10);
    await createPost(authorB, "from B", 5);

    const res = await getAgent().get(`/api/v1/posts?type=latest&authorId=${authorA}`);
    expect(res.status).toBe(200);
    expect(res.body.items.length).toBe(1);
    expect(res.body.items[0].authorId).toBe(authorA);
  });
});
