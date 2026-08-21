import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import request from "supertest";

vi.mock("#backend/db/repositories/users.js", () => ({
  getUserById: vi.fn(async (id: string) => ({
    id,
    email: "test@example.com",
    role: "standard",
    status: "active",
    createdAt: new Date(),
    updatedAt: new Date(),
  })),
}));

vi.mock("#backend/services/post-summary.service.js", () => ({
  getOrGeneratePostSummary: vi.fn(async (postId: string, forceRefresh = false) => {
    if (postId === "00000000-0000-0000-0000-000000000000") {
      throw new Error("POST_NOT_FOUND");
    }
    if (forceRefresh) {
      return {
        cached: false,
        summary: {
          id: "sum-1",
          postId,
          postSnapshot: "Refreshed summary content",
          keyHighlights: ["Key highlight 1"],
          sentiment: "Positive",
          commentCount: 5,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        },
      };
    }
    if (postId === "00000000-0000-0000-0000-000000000002") {
      return {
        cached: true,
        summary: {
          id: "sum-2",
          postId,
          postSnapshot: "Cached summary content",
          keyHighlights: ["Cached highlight"],
          sentiment: "Neutral",
          commentCount: 3,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        },
      };
    }
    return {
      cached: false,
      summary: {
        id: "sum-1",
        postId,
        postSnapshot: "Generated summary content",
        keyHighlights: ["Key highlight 1"],
        sentiment: "Constructive",
        commentCount: 5,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      },
    };
  }),
}));

import { createApp } from "#backend/index.js";
import { signAccessToken } from "#backend/lib/jwt.js";

describe("Post Summary API Routes", () => {
  const app = createApp();
  const validToken = signAccessToken({
    sub: "00000000-0000-0000-0000-000000000001",
    role: "standard",
    status: "active",
  });

  describe("Authentication Gate (Constitution Principle VI)", () => {
    it("Returns 401 UNAUTHENTICATED when guest attempts to GET summary", async () => {
      const res = await request(app)
        .get("/api/v1/posts/00000000-0000-0000-0000-000000000001/summary")
        .expect(401);

      expect(res.body.error).toEqual({
        code: "UNAUTHENTICATED",
        message: "Authentication required",
      });
    });

    it("Returns 401 UNAUTHENTICATED when guest attempts to POST summary refresh", async () => {
      const res = await request(app)
        .post("/api/v1/posts/00000000-0000-0000-0000-000000000001/summary/refresh")
        .expect(401);

      expect(res.body.error).toEqual({
        code: "UNAUTHENTICATED",
        message: "Authentication required",
      });
    });
  });

  describe("GET /api/v1/posts/:postId/summary", () => {
    it("Generates and returns fresh summary (cached: false) on first request for authenticated user", async () => {
      const res = await request(app)
        .get("/api/v1/posts/00000000-0000-0000-0000-000000000001/summary")
        .set("Authorization", `Bearer ${validToken}`)
        .expect(200);

      expect(res.body.success).toBe(true);
      expect(res.body.cached).toBe(false);
      expect(res.body.summary).toHaveProperty("postSnapshot", "Generated summary content");
      expect(res.body.summary).toHaveProperty("sentiment", "Constructive");
    });

    it("Returns cached summary (cached: true) when already generated", async () => {
      const res = await request(app)
        .get("/api/v1/posts/00000000-0000-0000-0000-000000000002/summary")
        .set("Authorization", `Bearer ${validToken}`)
        .expect(200);

      expect(res.body.success).toBe(true);
      expect(res.body.cached).toBe(true);
      expect(res.body.summary).toHaveProperty("postSnapshot", "Cached summary content");
    });

    it("Returns 404 NOT_FOUND when the requested post does not exist", async () => {
      const res = await request(app)
        .get("/api/v1/posts/00000000-0000-0000-0000-000000000000/summary")
        .set("Authorization", `Bearer ${validToken}`)
        .expect(404);

      expect(res.body.error).toEqual({
        code: "NOT_FOUND",
        message: "Post not found",
      });
    });
  });

  describe("POST /api/v1/posts/:postId/summary/refresh", () => {
    it("Forces regeneration of summary and returns HTTP 200 with cached: false", async () => {
      const res = await request(app)
        .post("/api/v1/posts/00000000-0000-0000-0000-000000000001/summary/refresh")
        .set("Authorization", `Bearer ${validToken}`)
        .expect(200);

      expect(res.body.success).toBe(true);
      expect(res.body.cached).toBe(false);
      expect(res.body.summary).toHaveProperty("postSnapshot", "Refreshed summary content");
    });

    it("Returns 404 NOT_FOUND when attempting to refresh summary for non-existent post", async () => {
      const res = await request(app)
        .post("/api/v1/posts/00000000-0000-0000-0000-000000000000/summary/refresh")
        .set("Authorization", `Bearer ${validToken}`)
        .expect(404);

      expect(res.body.error).toEqual({
        code: "NOT_FOUND",
        message: "Post not found",
      });
    });
  });
});
