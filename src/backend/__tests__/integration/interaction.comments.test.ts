import { describe, it, expect, beforeEach } from "vitest";
import { getAgent, clearDb } from "./auth.setup.js";

async function registerAndGetToken(email = "user@example.com"): Promise<{ accessToken: string; userId: string }> {
  const username = email.split("@")[0] + "_" + Math.random().toString(36).slice(2, 6);
  const res = await getAgent()
    .post("/api/v1/auth/register")
    .send({ email, username, password: "password123" });
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
    .send({ content: bodyText });
  expect(res.status).toBe(201);
  return res.body;
}

describe("User Interactions - Comments API Integration Tests", () => {
  beforeEach(async () => {
    await clearDb();
  });

  describe("POST /api/v1/posts/:postId/comments - Add Comment", () => {
    it("TC1: Should return 401 if user is not logged in", async () => {
      const author = await registerAndGetToken("author@example.com");
      const post = await createTestPost(author.accessToken);

      const res = await getAgent()
        .post(`/api/v1/posts/${post.id}/comments`)
        .send({ body: "Unauthorized comment" });

      expect(res.status).toBe(401);
    });

    it("TC2: Should allow a user to comment on an existing post", async () => {
      const author = await registerAndGetToken("author@example.com");
      const commenter = await registerAndGetToken("commenter@example.com");
      const post = await createTestPost(author.accessToken, "Discussion topic");

      const res = await getAgent()
        .post(`/api/v1/posts/${post.id}/comments`)
        .set("Authorization", `Bearer ${commenter.accessToken}`)
        .send({ body: "I totally agree!" });

      expect(res.status).toBe(201);
      expect(res.body.body).toBe("I totally agree!");
      expect(res.body.authorId).toBe(commenter.userId);
      expect(res.body.postId).toBe(post.id);
    });

    it("TC7: Should allow nested comment replies (parentCommentId)", async () => {
      const userA = await registerAndGetToken("usera@example.com");
      const userB = await registerAndGetToken("userb@example.com");
      const post = await createTestPost(userA.accessToken);

      // Top-level comment
      const commentRes = await getAgent()
        .post(`/api/v1/posts/${post.id}/comments`)
        .set("Authorization", `Bearer ${userA.accessToken}`)
        .send({ body: "Parent comment" });
      const parentCommentId = commentRes.body.id;

      // Nested reply
      const replyRes = await getAgent()
        .post(`/api/v1/posts/${post.id}/comments`)
        .set("Authorization", `Bearer ${userB.accessToken}`)
        .send({ body: "Reply to parent", parentCommentId });

      expect(replyRes.status).toBe(201);
      expect(replyRes.body.parentCommentId).toBe(parentCommentId);
    });

    it("TC3: Should return 422 if comment body is empty", async () => {
      const user = await registerAndGetToken();
      const post = await createTestPost(user.accessToken);

      const res = await getAgent()
        .post(`/api/v1/posts/${post.id}/comments`)
        .set("Authorization", `Bearer ${user.accessToken}`)
        .send({ body: "" });

      expect(res.status).toBe(422);
      expect(res.body.error.code).toBe("VALIDATION");
    });

    it("TC4: Should return 422 if comment body exceeds maximum character length", async () => {
      const user = await registerAndGetToken();
      const post = await createTestPost(user.accessToken);
      const longBody = "a".repeat(2001);

      const res = await getAgent()
        .post(`/api/v1/posts/${post.id}/comments`)
        .set("Authorization", `Bearer ${user.accessToken}`)
        .send({ body: longBody });

      expect(res.status).toBe(422);
    });

    it("TC9: Should reject nested reply if parent comment ID belongs to a different post", async () => {
      const user = await registerAndGetToken();
      const postA = await createTestPost(user.accessToken, "Post A");
      const postB = await createTestPost(user.accessToken, "Post B");

      const commentA = await getAgent()
        .post(`/api/v1/posts/${postA.id}/comments`)
        .set("Authorization", `Bearer ${user.accessToken}`)
        .send({ body: "Comment on Post A" });

      const res = await getAgent()
        .post(`/api/v1/posts/${postB.id}/comments`)
        .set("Authorization", `Bearer ${user.accessToken}`)
        .send({ body: "Mismatched reply", parentCommentId: commentA.body.id });

      expect([400, 404, 422]).toContain(res.status);
    });

    it("TC6: Should return 404 if post does not exist", async () => {
      const { accessToken } = await registerAndGetToken();
      const nonExistentId = "00000000-0000-0000-0000-000000000000";

      const res = await getAgent()
        .post(`/api/v1/posts/${nonExistentId}/comments`)
        .set("Authorization", `Bearer ${accessToken}`)
        .send({ body: "Ghost comment" });

      expect(res.status).toBe(404);
    });
  });

  describe("GET /api/v1/posts/:postId/comments - Get Post Comments", () => {
    it("TC10 & TC8: Should list comments for a post with reply counts & multi-tier nesting", async () => {
      const user = await registerAndGetToken();
      const post = await createTestPost(user.accessToken);

      const parentRes = await getAgent()
        .post(`/api/v1/posts/${post.id}/comments`)
        .set("Authorization", `Bearer ${user.accessToken}`)
        .send({ body: "First comment" });

      const replyRes = await getAgent()
        .post(`/api/v1/posts/${post.id}/comments`)
        .set("Authorization", `Bearer ${user.accessToken}`)
        .send({ body: "Reply to first comment", parentCommentId: parentRes.body.id });

      // Sub-reply to reply (TC8)
      await getAgent()
        .post(`/api/v1/posts/${post.id}/comments`)
        .set("Authorization", `Bearer ${user.accessToken}`)
        .send({ body: "Sub-reply to reply", parentCommentId: replyRes.body.id });

      const res = await getAgent().get(`/api/v1/posts/${post.id}/comments`);

      expect(res.status).toBe(200);
      expect(Array.isArray(res.body.items)).toBe(true);
      expect(res.body.items.length).toBe(3);

      const parentComment = res.body.items.find((item: any) => item.id === parentRes.body.id);
      expect(parentComment.body).toBe("First comment");
      expect(parentComment.replyCount).toBe(2);

      const replyComment = res.body.items.find((item: any) => item.id === replyRes.body.id);
      expect(replyComment.replyCount).toBe(1);
    });
  });

  describe("PATCH /api/v1/comments/:commentId - Edit Comment", () => {
    it("TC11: Should allow author to edit comment text", async () => {
      const user = await registerAndGetToken();
      const post = await createTestPost(user.accessToken);

      const commentRes = await getAgent()
        .post(`/api/v1/posts/${post.id}/comments`)
        .set("Authorization", `Bearer ${user.accessToken}`)
        .send({ body: "Initial text" });

      const editRes = await getAgent()
        .patch(`/api/v1/comments/${commentRes.body.id}`)
        .set("Authorization", `Bearer ${user.accessToken}`)
        .send({ body: "Updated text" });

      expect([200, 204]).toContain(editRes.status);
    });

    it("TC12: Should reject edit if body is whitespace-only", async () => {
      const user = await registerAndGetToken();
      const post = await createTestPost(user.accessToken);

      const commentRes = await getAgent()
        .post(`/api/v1/posts/${post.id}/comments`)
        .set("Authorization", `Bearer ${user.accessToken}`)
        .send({ body: "Initial text" });

      const editRes = await getAgent()
        .patch(`/api/v1/comments/${commentRes.body.id}`)
        .set("Authorization", `Bearer ${user.accessToken}`)
        .send({ body: "   " });

      expect(editRes.status).toBe(422);
    });
  });

  describe("DELETE /api/v1/comments/:commentId - Delete Comment", () => {
    it("TC14: Should allow author to delete their comment", async () => {
      const user = await registerAndGetToken();
      const post = await createTestPost(user.accessToken);

      const commentRes = await getAgent()
        .post(`/api/v1/posts/${post.id}/comments`)
        .set("Authorization", `Bearer ${user.accessToken}`)
        .send({ body: "Comment to delete" });
      const commentId = commentRes.body.id;

      const delRes = await getAgent()
        .delete(`/api/v1/comments/${commentId}`)
        .set("Authorization", `Bearer ${user.accessToken}`);

      expect(delRes.status).toBe(200);
      expect(delRes.body.ok).toBe(true);
    });

    it("TC15: Should return 403 if another user tries to delete the comment", async () => {
      const author = await registerAndGetToken("author@example.com");
      const stranger = await registerAndGetToken("stranger@example.com");
      const post = await createTestPost(author.accessToken);

      const commentRes = await getAgent()
        .post(`/api/v1/posts/${post.id}/comments`)
        .set("Authorization", `Bearer ${author.accessToken}`)
        .send({ body: "Protected comment" });

      const delRes = await getAgent()
        .delete(`/api/v1/comments/${commentRes.body.id}`)
        .set("Authorization", `Bearer ${stranger.accessToken}`);

      expect(delRes.status).toBe(403);
    });
  });
});
