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

function buildApp(limiter: express.RequestHandler, keyUser = false) {
  const app = express();
  app.use((req, _res, next) => {
    if (keyUser) {
      (req as { user?: { id: string; role: string; status: string } }).user = {
        id: "user-123",
        role: "standard",
        status: "active",
      };
    }
    next();
  });
  app.post("/test", limiter, (_req, res) => res.status(200).json({ ok: true }));
  return app;
}

describe("SlidingWindowStore (rolling 60s)", () => {
  it("allows 15 requests, blocks the 16th, and reports an accurate resetTime", async () => {
    const { interactionWriteRateLimiter } = await import("./rate-limit.js");
    const app = buildApp(interactionWriteRateLimiter);

    for (let i = 0; i < 15; i++) {
      const res = await request(app).post("/test");
      expect(res.status).toBe(200);
    }

    // The 16th request within 60s must be blocked.
    const blocked = await request(app).post("/test");
    expect(blocked.status).toBe(429);
    expect(blocked.body).toEqual({
      error: {
        code: "RATE_LIMITED",
        message: "Too many actions, please wait a moment before trying again.",
      },
    });

    // RateLimit-Reset / Retry-After reflect a ~60s rolling reset from the
    // oldest in-window hit, not a wall-clock boundary.
    const retryAfter = Number(blocked.headers["retry-after"]);
    expect(retryAfter).toBeGreaterThan(50);
    expect(retryAfter).toBeLessThanOrEqual(60);
  });

  it("keys by user id when an authenticated user is present, so separate users get separate budgets", async () => {
    const { interactionWriteRateLimiter } = await import("./rate-limit.js");
    const app = buildApp(interactionWriteRateLimiter, true);

    for (let i = 0; i < 15; i++) {
      const res = await request(app).post("/test");
      expect(res.status).toBe(200);
    }
    // Same user exceeds and is blocked.
    expect((await request(app).post("/test")).status).toBe(429);

    // A request WITHOUT an authenticated user keys by IP (127.0.0.1), which
    // differs from "user-123", so it is not blocked by the user's budget.
    const anonymousApp = buildApp(interactionWriteRateLimiter, false);
    const anonymous = await request(anonymousApp).post("/test");
    expect(anonymous.status).toBe(200);
  });
});

describe("middleware no-op in test environment", () => {
  it("re-exports a pass-through when NODE_ENV is test so integration tests are unaffected", async () => {
    process.env.NODE_ENV = "test";
    vi.resetModules();
    const { interactionWriteRateLimiter } = await import("./rate-limit.js");
    const app = express();
    app.post("/test", interactionWriteRateLimiter, (_req, res) =>
      res.status(200).json({ ok: true }),
    );

    for (let i = 0; i < 30; i++) {
      const res = await request(app).post("/test");
      expect(res.status).toBe(200);
    }
  });
});
