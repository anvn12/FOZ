import { describe, it, expect, beforeEach } from "vitest";
import { getAgent, clearDb } from "./auth.setup.js";
import { db } from "#backend/db/client.js";
import { userAccounts } from "#backend/db/schema/users.js";

async function registerAndGetToken(email = "user@example.com", role = "standard"): Promise<{ accessToken: string; userId: string }> {
  const res = await getAgent()
    .post("/api/v1/auth/register")
    .send({ email, password: "password123" });
  expect(res.status).toBe(201);
  const userId = res.body.user.id;
  
  if (role !== "standard") {
    await db.update(userAccounts).set({ role: role as any }).where(eq(userAccounts.id, userId));
  }
  
  return {
    accessToken: res.body.accessToken,
    userId,
  };
}

import { eq } from "drizzle-orm";

describe("Post Creation Integration Tests", () => {
  beforeEach(async () => {
    await clearDb();
  });

  describe("User Story 1 - Create a Simple Text Post", () => {
    it("POST /api/v1/posts creates a post with valid text content for an authenticated user", async () => {
      const { accessToken, userId } = await registerAndGetToken();
      const res = await getAgent()
        .post("/api/v1/posts")
        .set("Authorization", `Bearer ${accessToken}`)
        .send({ content: "Hello world!" });
      
      if (res.status !== 201) console.log("ERROR BODY:", res.body);
      expect(res.status).toBe(201);
      expect(res.body.content).toBe("Hello world!");
      expect(res.body.authorId).toBe(userId);
    });

    it("POST /api/v1/posts returns 400 Bad Request when attempting to post empty content", async () => {
      const { accessToken } = await registerAndGetToken();
      const res = await getAgent()
        .post("/api/v1/posts")
        .set("Authorization", `Bearer ${accessToken}`)
        .send({ content: "   " });
      
      expect([400, 422]).toContain(res.status); // Validation error
    });

    it("POST /api/v1/posts returns 401 Unauthorized for unauthenticated guest users", async () => {
      const res = await getAgent()
        .post("/api/v1/posts")
        .send({ content: "Hello!" });
      
      expect(res.status).toBe(401);
    });
  });

  describe("User Story 2 - Delete My Post", () => {
    it("Standard User can delete their own post", async () => {
      const { accessToken } = await registerAndGetToken();
      const postRes = await getAgent()
        .post("/api/v1/posts")
        .set("Authorization", `Bearer ${accessToken}`)
        .send({ content: "To be deleted" });
      
      const deleteRes = await getAgent()
        .delete(`/api/v1/posts/${postRes.body.id}`)
        .set("Authorization", `Bearer ${accessToken}`);
        
      expect(deleteRes.status).toBe(200);
      expect(deleteRes.body.ok).toBe(true);
    });

    it("Standard User cannot delete a post authored by another user", async () => {
      const user1 = await registerAndGetToken("user1@test.com");
      const user2 = await registerAndGetToken("user2@test.com");
      
      const postRes = await getAgent()
        .post("/api/v1/posts")
        .set("Authorization", `Bearer ${user1.accessToken}`)
        .send({ content: "User 1 post" });
        
      const deleteRes = await getAgent()
        .delete(`/api/v1/posts/${postRes.body.id}`)
        .set("Authorization", `Bearer ${user2.accessToken}`);
        
      expect(deleteRes.status).toBe(403);
    });

    it("Administrator can delete any post", async () => {
      const user1 = await registerAndGetToken("user1@test.com");
      const admin = await registerAndGetToken("admin@test.com", "administrator");
      
      const postRes = await getAgent()
        .post("/api/v1/posts")
        .set("Authorization", `Bearer ${user1.accessToken}`)
        .send({ content: "User 1 post" });
        
      const deleteRes = await getAgent()
        .delete(`/api/v1/posts/${postRes.body.id}`)
        .set("Authorization", `Bearer ${admin.accessToken}`);
        
      expect(deleteRes.status).toBe(200);
    });
  });

  describe("User Story 3 - Add Media Attachments", () => {
    it("POST /api/v1/posts creates a post with valid media attachments", async () => {
      const { accessToken } = await registerAndGetToken();
      const res = await getAgent()
        .post("/api/v1/posts")
        .set("Authorization", `Bearer ${accessToken}`)
        .send({
          content: "Check this out",
          attachments: [
            { fileUrl: "data:image/jpeg;base64,abc", fileType: "image/jpeg", fileSize: 1024 }
          ]
        });
        
      expect(res.status).toBe(201);
      expect(res.body.attachments).toHaveLength(1);
      expect(res.body.attachments[0].fileUrl).toBe("data:image/jpeg;base64,abc");
    });
  });

  describe("User Story 4 - Create a Chained Thread", () => {
    it("POST /api/v1/posts creates a sequence of chained posts in a single thread", async () => {
      const { accessToken } = await registerAndGetToken();
      const res = await getAgent()
        .post("/api/v1/posts")
        .set("Authorization", `Bearer ${accessToken}`)
        .send({
          posts: [
            { content: "First part" },
            { content: "Second part" }
          ]
        });
        
      expect(res.status).toBe(201);
      expect(res.body).toHaveLength(2);
      expect(res.body[0].content).toBe("First part");
      expect(res.body[1].content).toBe("Second part");
      expect(res.body[1].parentId).toBe(res.body[0].id);
    });
  });

  describe("Edge Cases", () => {
    it("POST /api/v1/posts accepts a post containing exactly 5,000 characters", async () => {
      const { accessToken } = await registerAndGetToken();
      const res = await getAgent()
        .post("/api/v1/posts")
        .set("Authorization", `Bearer ${accessToken}`)
        .send({ content: "a".repeat(5000) });
      expect(res.status).toBe(201);
    });

    it("POST /api/v1/posts rejects a post exceeding 5,000 characters", async () => {
      const { accessToken } = await registerAndGetToken();
      const res = await getAgent()
        .post("/api/v1/posts")
        .set("Authorization", `Bearer ${accessToken}`)
        .send({ content: "a".repeat(5001) });
      expect([400, 422]).toContain(res.status);
    });

    it("POST /api/v1/posts rejects attaching more than 4 files to a single post", async () => {
      const { accessToken } = await registerAndGetToken();
      const attachments = Array(5).fill({ fileUrl: "data:image/jpeg;base64,abc", fileType: "image/jpeg", fileSize: 1024 });
      const res = await getAgent()
        .post("/api/v1/posts")
        .set("Authorization", `Bearer ${accessToken}`)
        .send({ content: "Too many files", attachments });
      expect([400, 422]).toContain(res.status);
    });
  });
});
