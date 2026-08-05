import { describe, it, expect, beforeEach } from "vitest";
import { sql } from "drizzle-orm";
import { getAgent, clearDb } from "../../../__tests__/integration/auth.setup.js";
import { uniqueEmail, uniquePassword } from "../../../__tests__/fixtures/users.js";
import { db } from "#backend/db/client.js";

async function registerUserWithDisplayName(displayName: string) {
  const res = await getAgent()
    .post("/api/v1/auth/register")
    .send({ email: uniqueEmail(), password: uniquePassword() });
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
});
