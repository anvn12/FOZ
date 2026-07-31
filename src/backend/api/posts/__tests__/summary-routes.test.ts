import { describe, it, expect } from "vitest";
import request from "supertest";
import { createApp } from "#backend/index.js";

describe("Post Summary API Routes", () => {
  const app = createApp();

  it("returns 404 for non-existent post summary request", async () => {
    const res = await request(app)
      .get("/api/v1/posts/00000000-0000-0000-0000-000000000000/summary")
      .expect(404);

    expect(res.body.error.code).toBe("NOT_FOUND");
  });

  it("returns 404 for non-existent post summary refresh request", async () => {
    const res = await request(app)
      .post("/api/v1/posts/00000000-0000-0000-0000-000000000000/summary/refresh")
      .expect(404);

    expect(res.body.error.code).toBe("NOT_FOUND");
  });
});
