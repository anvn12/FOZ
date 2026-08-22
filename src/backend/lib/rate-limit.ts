import rateLimit, { ipKeyGenerator } from "express-rate-limit";
import type { Request, RequestHandler } from "express";
import type { AuthedRequest } from "#backend/api/auth/middleware.js";

const noop: RequestHandler = (_req, _res, next) => next();

/**
 * A true sliding-window store: each client's hits are tracked as timestamps,
 * and any hit older than `windowMs` is pruned on every read. `resetTime` is
 * the moment the oldest in-window hit falls out, i.e. the exact time a new
 * request would be allowed again. This differs from express-rate-limit's
 * built-in fixed-window MemoryStore, which resets on wall-clock boundaries.
 */
class SlidingWindowStore {
  private readonly hits = new Map<string, number[]>();
  private windowMs = 60_000;
  localKeys = true;

  init(options: { windowMs: number }) {
    this.windowMs = options.windowMs;
  }

  private prune(key: string, now: number) {
    const list = this.hits.get(key);
    if (!list) return list;
    const cutoff = now - this.windowMs;
    let i = 0;
    while (i < list.length && (list[i] ?? 0) <= cutoff) i++;
    if (i > 0) list.splice(0, i);
    return list;
  }

  async get(key: string) {
    const now = Date.now();
    const list = this.prune(key, now);
    if (!list || list.length === 0) return undefined;
    const oldest = list[0];
    if (oldest === undefined) return undefined;
    return { totalHits: list.length, resetTime: new Date(oldest + this.windowMs) };
  }

  async increment(key: string) {
    const now = Date.now();
    const list = this.prune(key, now);
    if (!list) {
      this.hits.set(key, [now]);
      return { totalHits: 1, resetTime: new Date(now + this.windowMs) };
    }
    list.push(now);
    const oldest = list[0];
    if (oldest === undefined) {
      return { totalHits: 1, resetTime: new Date(now + this.windowMs) };
    }
    return { totalHits: list.length, resetTime: new Date(oldest + this.windowMs) };
  }

  async decrement(key: string) {
    const list = this.hits.get(key);
    if (list && list.length > 0) list.pop();
  }

  async resetKey(key: string) {
    this.hits.delete(key);
  }

  async resetAll() {
    this.hits.clear();
  }

  shutdown() {
    this.hits.clear();
  }
}

/**
 * Key by authenticated user id so the budget is per account, falling back to
 * the client IP for unauthenticated requests.
 */
const userKeyGenerator = (req: Request): string => {
  const userId = (req as AuthedRequest).user?.id;
  if (userId) return userId;
  if (req.ip) return ipKeyGenerator(req.ip);
  return "unknown";
};

const writeLimiterOptions = {
  windowMs: 60_000,
  limit: 15,
  standardHeaders: "draft-7" as const,
  legacyHeaders: false,
  store: new SlidingWindowStore(),
  keyGenerator: userKeyGenerator,
  message: {
    error: {
      code: "RATE_LIMITED",
      message: "Too many actions, please wait a moment before trying again.",
    },
  },
};

export const authRateLimiter: RequestHandler =
  process.env.NODE_ENV === "production"
    ? rateLimit({
        windowMs: 15 * 60 * 1000,
        limit: 100,
        standardHeaders: "draft-7",
        legacyHeaders: false,
        message: { error: { code: "RATE_LIMITED", message: "Too many requests, slow down." } },
      })
    : noop;

export const summaryRateLimiter: RequestHandler =
  process.env.NODE_ENV === "test"
    ? noop
    : rateLimit({
        windowMs: 1 * 60 * 1000,
        limit: 10,
        standardHeaders: "draft-7",
        legacyHeaders: false,
        message: {
          error: {
            code: "RATE_LIMITED",
            message: "Too many summary requests, please try again in a minute.",
          },
        },
      });

/**
 * Rolling-window limiter for comment and post write actions: 15 actions per
 * user per rolling 60s. Applies to comment create/edit/delete/report and
 * post create.
 */
export const interactionWriteRateLimiter: RequestHandler =
  process.env.NODE_ENV === "test" ? noop : rateLimit(writeLimiterOptions);
