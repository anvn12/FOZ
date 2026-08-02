import fs from "node:fs/promises";
import path from "node:path";
import { afterAll, describe, expect, it, vi } from "vitest";
import request from "supertest";
import sharp from "sharp";

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

import { createApp } from "#backend/index.js";
import { signAccessToken } from "#backend/lib/jwt.js";

describe("Upload API Routes (/api/v1/upload)", () => {
  const app = createApp();
  const token = signAccessToken({
    sub: "00000000-0000-0000-0000-000000000001",
    role: "standard",
    status: "active",
  });

  afterAll(async () => {
    try {
      await fs.rm(path.join(process.cwd(), "uploads"), { recursive: true, force: true });
    } catch {}
  });


  it("returns 401 UNAUTHENTICATED when authorization header is missing", async () => {
    const res = await request(app)
      .post("/api/v1/upload/image")
      .expect(401);

    expect(res.body.error.code).toBe("UNAUTHENTICATED");
  });

  it("returns 400 MISSING_FILE when no image field is attached", async () => {
    const res = await request(app)
      .post("/api/v1/upload/image")
      .set("Authorization", `Bearer ${token}`)
      .field("uploadType", "feed_post")
      .expect(400);

    expect(res.body.error.code).toBe("MISSING_FILE");
  });

  it("returns 400 INVALID_FILE_TYPE when uploading non-image binary data", async () => {
    const res = await request(app)
      .post("/api/v1/upload/image")
      .set("Authorization", `Bearer ${token}`)
      .attach("image", Buffer.from("NOT_AN_IMAGE"), "document.pdf")
      .field("uploadType", "feed_post")
      .expect(400);

    expect(res.body.error.code).toBe("INVALID_FILE_TYPE");
  });

  it("returns 201 Created and processes valid image to WebP", async () => {
    const testImageBuffer = await sharp({
      create: { width: 100, height: 100, channels: 4, background: { r: 0, g: 128, b: 255, alpha: 1 } },
    })
      .png()
      .toBuffer();

    const res = await request(app)
      .post("/api/v1/upload/image")
      .set("Authorization", `Bearer ${token}`)
      .attach("image", testImageBuffer, "sample.png")
      .field("uploadType", "feed_post")
      .expect(201);

    expect(res.body.success).toBe(true);
    expect(res.body.data.mimeType).toBe("image/webp");
    expect(res.body.data.url).toMatch(/^\/uploads\/images\/.*\.webp$/);
    expect(res.body.data.width).toBeLessThanOrEqual(1600);
    expect(res.body.data.height).toBeLessThanOrEqual(1600);
  });
});
