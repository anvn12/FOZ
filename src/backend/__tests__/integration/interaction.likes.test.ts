import { describe, it, expect, beforeEach } from "vitest";
import { getAgent, clearDb } from "./auth.setup.js";

async function registerAndGetToken(email = "user@example.com"): Promise<{ accessToken: string; userId: string }> {
  const res = await getAgent()
    .post("/api/v1/auth/register")
    .send({ email, password: "password123" });
  expect(res.status).toBe(201);
  return {
    accessToken: res.body.accessToken,
    userId: res.body.user.id,
  };
}

async function createTestPost(accessToken: string, bodyText = "Hello forum!") {
  const res = await getAgent()
    .post("/api/v1/posts")
    .set("Authorization", `Bearer ${accessToken}`)
    .send({ body: bodyText });
  expect(res.status).toBe(201);
  return res.body;
}

describe("User Interactions - Likes/Reactions API Integration Tests", () => {
  beforeEach(async () => {
    await clearDb();
  });

  describe("POST / DELETE /api/v1/posts/:postId/reaction - Toggle Post Reaction", () => {
    it("should return 401 if user is not logged in", async () => {
      const author = await registerAndGetToken("author@example.com");
      const post = await createTestPost(author.accessToken);

      const res = await getAgent().post(`/api/v1/posts/${post.id}/reaction`);

      expect(res.status).toBe(401);
    });

    it("should allow a user to like and unlike a post (reaction)", async () => {
      const { accessToken } = await registerAndGetToken();
      const post = await createTestPost(accessToken, "Like me");

      // Step 1: Like (POST)
      const likeRes = await getAgent()
        .post(`/api/v1/posts/${post.id}/reaction`)
        .set("Authorization", `Bearer ${accessToken}`);

      expect(likeRes.status).toBe(200);
      expect(likeRes.body.active).toBe(true);
      expect(likeRes.body.likeCount).toBe(1);

      // Step 2: Unlike (DELETE)
      const unlikeRes = await getAgent()
        .delete(`/api/v1/posts/${post.id}/reaction`)
        .set("Authorization", `Bearer ${accessToken}`);

      expect(unlikeRes.status).toBe(200);
      expect(unlikeRes.body.active).toBe(false);
      expect(unlikeRes.body.likeCount).toBe(0);
    });

    it("should correctly accumulate likes from multiple users", async () => {
      const userA = await registerAndGetToken("usera@example.com");
      const userB = await registerAndGetToken("userb@example.com");
      const post = await createTestPost(userA.accessToken);

      await getAgent()
        .post(`/api/v1/posts/${post.id}/reaction`)
        .set("Authorization", `Bearer ${userA.accessToken}`);

      const resB = await getAgent()
        .post(`/api/v1/posts/${post.id}/reaction`)
        .set("Authorization", `Bearer ${userB.accessToken}`);

      expect(resB.status).toBe(200);
      expect(resB.body.likeCount).toBe(2);
    });
  });

  describe("POST / DELETE /api/v1/comments/:commentId/reaction - Toggle Comment Reaction", () => {
    it("should allow a user to like and unlike a comment", async () => {
      const user = await registerAndGetToken();
      const post = await createTestPost(user.accessToken);

      const commentRes = await getAgent()
        .post(`/api/v1/posts/${post.id}/comments`)
        .set("Authorization", `Bearer ${user.accessToken}`)
        .send({ body: "Great comment" });
      const commentId = commentRes.body.id;

      // Like comment
      const likeRes = await getAgent()
        .post(`/api/v1/comments/${commentId}/reaction`)
        .set("Authorization", `Bearer ${user.accessToken}`);

      expect(likeRes.status).toBe(200);
      expect(likeRes.body.active).toBe(true);

      // Unlike comment
      const unlikeRes = await getAgent()
        .delete(`/api/v1/comments/${commentId}/reaction`)
        .set("Authorization", `Bearer ${user.accessToken}`);

      expect(unlikeRes.status).toBe(200);
      expect(unlikeRes.body.active).toBe(false);
    });
  });
});
