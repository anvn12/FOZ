import { describe, it, expect, vi } from "vitest";
import request from "supertest";
import type { Express } from "express";

// Isolated in its own file because it mocks the posts service module for the
// whole file (vi.mock is hoisted/file-scoped) — keeping it separate avoids
// affecting the real-DB tests in feed-routes.test.ts and feed.test.ts.
vi.mock("#backend/services/interactions/posts.js", async () => {
  const actual = await vi.importActual<typeof import("#backend/services/interactions/posts.js")>(
    "#backend/services/interactions/posts.js",
  );
  return {
    ...actual,
    listForYouFeed: vi.fn().mockRejectedValue(new Error("ranking service unavailable")),
  };
});

describe("GET /api/v1/posts?type=for-you graceful degradation", () => {
  it("falls back to the chronological feed with degraded:true when listForYouFeed throws", async () => {
    const { createApp } = await import("#backend/index.js");
    const { clearDb } = await import("./auth.setup.js");
    await clearDb();

    const agent = request(createApp() as Express);
    const suffix = Math.random().toString(36).slice(2, 8);
    const registerRes = await agent
      .post("/api/v1/auth/register")
      .send({ email: `degraded_${suffix}@test.local`, username: `degraded_${suffix}`, password: "password123" });
    expect(registerRes.status).toBe(201);
    const accessToken = registerRes.body.accessToken as string;

    const res = await agent.get("/api/v1/posts?type=for-you").set("Authorization", `Bearer ${accessToken}`);

    expect(res.status).toBe(200);
    expect(res.body.degraded).toBe(true);
    expect(Array.isArray(res.body.items)).toBe(true);
  });
});
