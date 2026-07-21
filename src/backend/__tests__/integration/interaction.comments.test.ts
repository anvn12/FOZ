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

async function createTestPost(accessToken: string, content = "Hello forum!") {
  const res = await getAgent()
    .post("/api/v1/posts")
    .set("Authorization", `Bearer ${accessToken}`)
    .send({ content });
  expect(res.status).toBe(201);
  return res.body.post;
}

describe("User Interactions - Comments API Integration Tests", () => {
  beforeEach(async () => {
    await clearDb();
  });

  describe("POST /api/v1/posts/:postId/comments - Add Comment", () => {
    it("should return 401 if user is not logged in", async () => {
      const author = await registerAndGetToken("author@example.com");
      const post = await createTestPost(author.accessToken);

      const res = await getAgent()
        .post(`/api/v1/posts/${post.id}/comments`)
        .send({ content: "Unauthorized comment" });

      expect(res.status).toBe(401);
    });

    it("should allow a user to comment on an existing post", async () => {
      const author = await registerAndGetToken("author@example.com");
      const commenter = await registerAndGetToken("commenter@example.com");
      const post = await createTestPost(author.accessToken, "Discussion topic");

      const res = await getAgent()
        .post(`/api/v1/posts/${post.id}/comments`)
        .set("Authorization", `Bearer ${commenter.accessToken}`)
        .send({ content: "I totally agree!" });

      expect(res.status).toBe(201);
      expect(res.body.comment.content).toBe("I totally agree!");
      expect(res.body.comment.authorId).toBe(commenter.userId);
      expect(res.body.comment.postId).toBe(post.id);
    });

    it("should allow nested comment replies (parentCommentId)", async () => {
      const userA = await registerAndGetToken("usera@example.com");
      const userB = await registerAndGetToken("userb@example.com");
      const post = await createTestPost(userA.accessToken);

      // Top-level comment
      const commentRes = await getAgent()
        .post(`/api/v1/posts/${post.id}/comments`)
        .set("Authorization", `Bearer ${userA.accessToken}`)
        .send({ content: "Parent comment" });
      const parentCommentId = commentRes.body.comment.id;

      // Nested reply
      const replyRes = await getAgent()
        .post(`/api/v1/posts/${post.id}/comments`)
        .set("Authorization", `Bearer ${userB.accessToken}`)
        .send({ content: "Reply to parent", parentCommentId });

      expect(replyRes.status).toBe(201);
      expect(replyRes.body.comment.parentCommentId).toBe(parentCommentId);
    });

    it("should return 422 if comment content is empty", async () => {
      const user = await registerAndGetToken();
      const post = await createTestPost(user.accessToken);

      const res = await getAgent()
        .post(`/api/v1/posts/${post.id}/comments`)
        .set("Authorization", `Bearer ${user.accessToken}`)
        .send({ content: "" });

      expect(res.status).toBe(422);
      expect(res.body.error.code).toBe("VALIDATION");
    });

    it("should return 404 if post does not exist", async () => {
      const { accessToken } = await registerAndGetToken();
      const nonExistentId = "00000000-0000-0000-0000-000000000000";

      const res = await getAgent()
        .post(`/api/v1/posts/${nonExistentId}/comments`)
        .set("Authorization", `Bearer ${accessToken}`)
        .send({ content: "Ghost comment" });

      expect(res.status).toBe(404);
    });
  });

  describe("GET /api/v1/posts/:postId/comments - Get Post Comments", () => {
    it("should list comments for a specific post", async () => {
      const user = await registerAndGetToken();
      const post = await createTestPost(user.accessToken);

      await getAgent()
        .post(`/api/v1/posts/${post.id}/comments`)
        .set("Authorization", `Bearer ${user.accessToken}`)
        .send({ content: "First comment" });

      const res = await getAgent().get(`/api/v1/posts/${post.id}/comments`);

      expect(res.status).toBe(200);
      expect(Array.isArray(res.body.comments)).toBe(true);
      expect(res.body.comments.length).toBe(1);
      expect(res.body.comments[0].content).toBe("First comment");
    });
  });

  describe("DELETE /api/v1/comments/:commentId - Delete Comment", () => {
    it("should allow author to delete their comment", async () => {
      const user = await registerAndGetToken();
      const post = await createTestPost(user.accessToken);

      const commentRes = await getAgent()
        .post(`/api/v1/posts/${post.id}/comments`)
        .set("Authorization", `Bearer ${user.accessToken}`)
        .send({ content: "Comment to delete" });
      const commentId = commentRes.body.comment.id;

      const delRes = await getAgent()
        .delete(`/api/v1/comments/${commentId}`)
        .set("Authorization", `Bearer ${user.accessToken}`);

      expect(delRes.status).toBe(200);
    });

    it("should return 403 if another user tries to delete the comment", async () => {
      const author = await registerAndGetToken("author@example.com");
      const stranger = await registerAndGetToken("stranger@example.com");
      const post = await createTestPost(author.accessToken);

      const commentRes = await getAgent()
        .post(`/api/v1/posts/${post.id}/comments`)
        .set("Authorization", `Bearer ${author.accessToken}`)
        .send({ content: "Protected comment" });

      const delRes = await getAgent()
        .delete(`/api/v1/comments/${commentRes.body.comment.id}`)
        .set("Authorization", `Bearer ${stranger.accessToken}`);

      expect(delRes.status).toBe(403);
    });
  });
});
