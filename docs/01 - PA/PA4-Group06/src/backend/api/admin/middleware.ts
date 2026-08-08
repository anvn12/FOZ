import type { RequestHandler } from "express";
import { requireAuth, type AuthedRequest } from "#backend/api/auth/middleware.js";

export const requireAdminRole: RequestHandler = (req, res, next) => {
  requireAuth(req, res, () => {
    const user = (req as AuthedRequest).user;
    if (!user || user.role !== "administrator") {
      return res.status(403).json({
        error: {
          code: "FORBIDDEN",
          message: "Administrator privilege required to access this resource",
        },
      });
    }
    next();
  });
};
