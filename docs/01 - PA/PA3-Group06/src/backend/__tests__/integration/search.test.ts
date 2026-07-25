import { describe, it, expect, beforeEach } from "vitest";
import { sql } from "drizzle-orm";
import { getAgent, clearDb, expectFastResponse } from "./auth.setup.js";
import { uniqueEmail, uniquePassword } from "../fixtures/users.js";
import { db } from "#backend/db/client.js";

// --- test data helpers ----------------------------------------------------

async function registerUserWithDisplayName(displayName: string) {
  const res = await getAgent()
    .post("/api/v1/auth/register")
    .send({ email: uniqueEmail(), password: uniquePassword() });
  if (res.status !== 201) throw new Error(`register failed: ${res.status} ${JSON.stringify(res.body)}`);
  // /api/v1/auth/register auto-generates the display name; override for searchability.
  await db.execute(sql`
    UPDATE profiles SET display_name = ${displayName} WHERE user_account_id = ${res.body.user.id}
  `);
  return { userId: res.body.user.id as string, email: res.body.user.email as string };
}

async function setAccountStatus(userId: string, status: "active" | "suspended" | "banned" | "pending") {
  await db.execute(sql`UPDATE user_accounts SET status = ${status} WHERE id = ${userId}`);
}

async function setProfileBio(userId: string, bio: string) {
  await db.execute(sql`UPDATE profiles SET bio = ${bio} WHERE user_account_id = ${userId}`);
}

async function insertPost(args: {
  authorId: string;
  body: string;
  visibilityState?: "public" | "hidden";
  lifecycleState?: "active" | "hidden" | "removed_by_moderation" | "removed_by_administration";
}) {
  const visibility = args.visibilityState ?? "public";
  const lifecycle = args.lifecycleState ?? "active";
  const rows = (await db.execute(sql`
    INSERT INTO posts (author_id, body, visibility_state, lifecycle_state)
    VALUES (${args.authorId}, ${args.body}, ${visibility}, ${lifecycle})
    RETURNING id, created_at
  `)) as Array<{ id: string; created_at: Date }>;
  const row = rows[0]!;
  return { id: row.id, createdAt: row.created_at };
}

// --- tests ----------------------------------------------------------------

describe("GET /search (US: Search & Discovery — Vision Doc §5.4)", () => {
  beforeEach(async () => {
    await clearDb();
  });

  describe("access (Vision: 'all users')", () => {
    it("returns 200 without auth — guests can search", async () => {
      const res = await getAgent().get("/search").query({ q: "anything" });
      expect(res.status).toBe(200);
    });
  });

  describe("q validation", () => {
    it("missing q returns 422 with VALIDATION code", async () => {
      const res = await getAgent().get("/search");
      expect(res.status).toBe(422);
      expect(res.body.error.code).toBe("VALIDATION");
    });

    it("empty q returns 422", async () => {
      const res = await getAgent().get("/search").query({ q: "" });
      expect(res.status).toBe(422);
      expect(res.body.error.code).toBe("VALIDATION");
    });

    it("q longer than 100 chars returns 422", async () => {
      const res = await getAgent().get("/search").query({ q: "a".repeat(101) });
      expect(res.status).toBe(422);
      expect(res.body.error.code).toBe("VALIDATION");
    });
  });

  describe("type validation", () => {
    it("invalid type returns 422", async () => {
      const res = await getAgent().get("/search").query({ q: "x", type: "comments" });
      expect(res.status).toBe(422);
      expect(res.body.error.code).toBe("VALIDATION");
    });
  });

  describe("type=posts", () => {
    it("happy path: case-insensitive substring match in body, returns envelope", async () => {
      const { userId } = await registerUserWithDisplayName("Author");
      await insertPost({ authorId: userId, body: "Discussing FOZ roadmap" });
      await insertPost({ authorId: userId, body: "Unrelated content here" });

      const res = await getAgent().get("/search").query({ q: "foz", type: "posts" });

      expect(res.status).toBe(200);
      expect(Array.isArray(res.body.items)).toBe(true);
      expect(res.body.items).toHaveLength(1);
      expect(res.body.items[0].body).toMatch(/FOZ/);
      expect(res.body.nextCursor).toBeNull();
    });

    it("excludes posts with lifecycle_state != 'active' and visibility_state = 'hidden'", async () => {
      const { userId } = await registerUserWithDisplayName("Author");
      await insertPost({ authorId: userId, body: "kept-post" });
      await insertPost({ authorId: userId, body: "removed-post", lifecycleState: "removed_by_moderation" });
      await insertPost({ authorId: userId, body: "hidden-post", visibilityState: "hidden" });
      await insertPost({ authorId: userId, body: "removed-admin-post", lifecycleState: "removed_by_administration" });

      const res = await getAgent().get("/search").query({ q: "post", type: "posts" });

      expect(res.status).toBe(200);
      const bodies = res.body.items.map((it: { body: string }) => it.body);
      expect(bodies).toContain("kept-post");
      expect(bodies).not.toContain("removed-post");
      expect(bodies).not.toContain("hidden-post");
      expect(bodies).not.toContain("removed-admin-post");
    });
  });

  describe("type=users", () => {
    it("matches case-insensitive substring in display_name", async () => {
      await registerUserWithDisplayName("AliceSmith");
      await registerUserWithDisplayName("BobJones");

      const res = await getAgent().get("/search").query({ q: "ALICESMITH", type: "users" });

      expect(res.status).toBe(200);
      expect(res.body.items).toHaveLength(1);
      expect(res.body.items[0].displayName).toBe("AliceSmith");
    });

    it("matches only display_name, NOT bio", async () => {
      const { userId: aliceId } = await registerUserWithDisplayName("Alice");
      const { userId: bobId } = await registerUserWithDisplayName("Bob");
      // Bob's bio contains "Alice" — must not match when searching for "Alice".
      await setProfileBio(bobId, "I am friends with Alice");

      const res = await getAgent().get("/search").query({ q: "Alice", type: "users" });

      expect(res.status).toBe(200);
      const ids = res.body.items.map((it: { id: string }) => it.id);
      expect(ids).toContain(aliceId);
      expect(ids).not.toContain(bobId);
    });

    it("excludes accounts with status != 'active' (suspended/banned/pending)", async () => {
      const { userId: activeId } = await registerUserWithDisplayName("ActiveOne");
      const { userId: suspendedId } = await registerUserWithDisplayName("SuspendedOne");
      const { userId: bannedId } = await registerUserWithDisplayName("BannedOne");
      await setAccountStatus(suspendedId, "suspended");
      await setAccountStatus(bannedId, "banned");

      const res = await getAgent().get("/search").query({ q: "One", type: "users" });

      expect(res.status).toBe(200);
      const ids = res.body.items.map((it: { id: string }) => it.id);
      expect(ids).toContain(activeId);
      expect(ids).not.toContain(suspendedId);
      expect(ids).not.toContain(bannedId);
    });
  });

  describe("type=all", () => {
    it("returns mixed items with type discriminator (post | user)", async () => {
      const { userId } = await registerUserWithDisplayName("TargetUser");
      // Bob's displayName does NOT contain "Target" — but Bob's post body does.
      const { userId: bobId } = await registerUserWithDisplayName("Bob");
      await insertPost({ authorId: bobId, body: "Post about TargetUser topic" });

      const res = await getAgent().get("/search").query({ q: "TargetUser", type: "all" });

      expect(res.status).toBe(200);
      expect(res.body.items).toHaveLength(2);
      const types = res.body.items.map((it: { type: string }) => it.type).sort();
      expect(types).toEqual(["post", "user"]);
      // user item's id matches the user we registered
      const userItem = res.body.items.find((it: { type: string }) => it.type === "user");
      const postItem = res.body.items.find((it: { type: string }) => it.type === "post");
      expect(userItem.id).toBe(userId);
      expect(postItem.body).toMatch(/TargetUser/);
    });
  });

  describe("performance NFR (Vision §6: <500ms for standard queries)", () => {
    it("responds within 500ms", async () => {
      const { userId } = await registerUserWithDisplayName("Perf");
      for (let i = 0; i < 20; i++) {
        await insertPost({ authorId: userId, body: `noise post ${i}` });
      }
      await insertPost({ authorId: userId, body: "target post for perf" });

      const t0 = Date.now();
      const res = await getAgent().get("/search").query({ q: "target", type: "posts" });
      const elapsed = Date.now() - t0;

      expect(res.status).toBe(200);
      expect(elapsed).toBeLessThan(2000); // generous CI ceiling
      expectFastResponse(res, 500); // strict NFR ceiling
    });
  });
});
