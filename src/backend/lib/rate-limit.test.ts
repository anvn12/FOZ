import { describe, it, expect, beforeEach, afterAll, vi } from "vitest";
import express from "express";
import request from "supertest";

// The limiters read NODE_ENV at module load time and become no-ops in test
// mode, so we reload the module with NODE_ENV=production to exercise the
// real express-rate-limit path. Each `import("./rate-limit.js")` after
// `vi.resetModules()` yields a fresh limiter with its own in-memory store.
const originalNodeEnv = process.env.NODE_ENV;

beforeEach(() => {
  process.env.NODE_ENV = "production";
  vi.resetModules();
});

afterAll(() => {
  process.env.NODE_ENV = originalNodeEnv;
  vi.resetModules();
});

describe("commentWriteRateLimiter", () => {
  it("allows requests within the per-minute budget", async () => {
    const { commentWriteRateLimiter } = await import("./rate-limit.js");
    const app = express();
    app.post("/test", commentWriteRateLimiter, (_req, res) => res.status(200).json({ ok: true }));

    for (let i = 0; i < 15; i++) {
      const res = await request(app).post("/test");
      expect(res.status).toBe(200);
    }
  });

  it("returns 429 RATE_LIMITED once the per-minute budget is exhausted", async () => {
    const { commentWriteRateLimiter } = await import("./rate-limit.js");
    const app = express();
    app.post("/test", commentWriteRateLimiter, (_req, res) => res.status(200).json({ ok: true }));

    for (let i = 0; i < 15; i++) {
      await request(app).post("/test");
    }

    const blocked = await request(app).post("/test");
    expect(blocked.status).toBe(429);
    expect(blocked.body).toEqual({
      error: {
        code: "RATE_LIMITED",
        message: "Too many comment actions, please try again in a minute.",
      },
    });
  });
});
