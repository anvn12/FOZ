import rateLimit from "express-rate-limit";
import type { RequestHandler } from "express";

const noop: RequestHandler = (_req, _res, next) => next();

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
        message: { error: { code: "RATE_LIMITED", message: "Too many summary requests, please try again in a minute." } },
      });

