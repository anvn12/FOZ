import type { Request, Response, NextFunction, RequestHandler } from "express";
import { z, type ZodTypeAny } from "zod";
import { verifyAccessToken } from "#backend/lib/jwt.js";
import { getUserById } from "#backend/db/repositories/users.js";

export type AuthedRequest = Request & {
  user?: { id: string; role: string; status: string };
};

export const requireAuth: RequestHandler = async (req, res, next) => {
  const header = req.header("authorization") ?? "";
  const match = header.match(/^Bearer\s+(.+)$/i);
  if (!match || !match[1]) {
    return res
      .status(401)
      .json({ error: { code: "UNAUTHENTICATED", message: "Authentication required" } });
  }
  try {
    const payload = verifyAccessToken(match[1]);
    const user = await getUserById(payload.sub);
    if (!user) {
      return res
        .status(401)
        .json({ error: { code: "UNAUTHENTICATED", message: "Authentication required" } });
    }
    if (user.status !== "active") {
      return res.status(403).json({
        error: { code: "ACCOUNT_NOT_ACTIVE", message: "Your account is not currently available" },
      });
    }
    (req as AuthedRequest).user = { id: user.id, role: user.role, status: user.status };
    next();
  } catch {
    return res
      .status(401)
      .json({ error: { code: "UNAUTHENTICATED", message: "Authentication required" } });
  }
};

/** Attach an active viewer when a valid bearer token is supplied, without blocking public reads. */
export const optionalAuth: RequestHandler = async (req, _res, next) => {
  const match = (req.header("authorization") ?? "").match(/^Bearer\s+(.+)$/i);
  if (!match?.[1]) return next();
  try {
    const payload = verifyAccessToken(match[1]);
    const user = await getUserById(payload.sub);
    if (user?.status === "active") {
      (req as AuthedRequest).user = { id: user.id, role: user.role, status: user.status };
    }
  } catch {
    // Public reads deliberately remain available when a stale token is present.
  }
  next();
};

export const requireGuest: RequestHandler = (req, res, next) => {
  const header = req.header("authorization") ?? "";
  if (header && /^Bearer\s+.+$/i.test(header)) {
    return res
      .status(409)
      .json({ error: { code: "ALREADY_SIGNED_IN", message: "You are already signed in" } });
  }
  next();
};

export function requireRole(roles: string[]): RequestHandler {
  return (req, res, next) => {
    const user = (req as AuthedRequest).user;
    if (!user) {
      return res
        .status(401)
        .json({ error: { code: "UNAUTHENTICATED", message: "Authentication required" } });
    }
    if (!roles.includes(user.role)) {
      return res
        .status(403)
        .json({ error: { code: "FORBIDDEN", message: "You do not have permission to access this resource" } });
    }
    next();
  };
}

export function validateBody<S extends ZodTypeAny>(schema: S): RequestHandler {
  return (req, res, next) => {
    const result = schema.safeParse(req.body);
    if (!result.success) {
      const fields: Record<string, string> = {};
      for (const issue of result.error.issues) {
        const key = issue.path.join(".") || "_";
        fields[key] = issue.message;
      }
      return res.status(422).json({
        error: { code: "VALIDATION", message: "Invalid request", fields },
      });
    }
    req.body = result.data;
    next();
  };
}

// ponytail: re-reading user.status on every request is the simplest correct
// way to honor FR-006 mid-session status changes; add a request-scoped cache
// if profiling shows a hot path.
export const _reExportForTypeInference = { z };
