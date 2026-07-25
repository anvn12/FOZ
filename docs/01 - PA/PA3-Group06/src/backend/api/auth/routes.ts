import { Router, type RequestHandler } from "express";
import { RegisterRequest, LoginRequest, ChangePasswordRequest } from "#shared/schemas/auth.js";
import { authRateLimiter } from "#backend/lib/rate-limit.js";
import { requireAuth, requireGuest, validateBody, type AuthedRequest } from "#backend/api/auth/middleware.js";
import {
  register,
  login,
  refresh,
  logout,
  changePassword,
  parseRefreshCookie,
  REFRESH_COOKIE_NAME,
  clearRefreshCookieOptions,
  AuthError,
} from "#backend/api/auth/auth.service.js";

export const authRouter: Router = Router();

function setRefreshCookie(res: Parameters<RequestHandler>[1], cookie: {
  name: string;
  value: string;
  options: ReturnType<typeof clearRefreshCookieOptions>;
}) {
  res.cookie(cookie.name, cookie.value, cookie.options);
}

function clearRefreshCookie(res: Parameters<RequestHandler>[1]) {
  res.clearCookie(REFRESH_COOKIE_NAME, clearRefreshCookieOptions());
}

function handleAuthError(err: unknown, res: Parameters<RequestHandler>[1]) {
  if (err instanceof AuthError) {
    const isDuplicate = err.status === 409;
    return res.status(err.status).json({
      error: {
        code: err.code,
        message: isDuplicate
          ? "An account with this email already exists"
          : err.code === "INVALID_CREDENTIALS"
            ? "Invalid email or password"
            : err.code === "ACCOUNT_NOT_ACTIVE"
              ? "Your account is not currently available"
              : "Authentication failed",
      },
    });
  }
  throw err;
}

authRouter.post(
  "/register",
  requireGuest,
  authRateLimiter,
  validateBody(RegisterRequest),
  async (req, res, next) => {
    try {
      const session = await register(req.body);
      setRefreshCookie(res, session.cookie);
      res.status(201).json(session.auth);
    } catch (err) {
      try {
        return handleAuthError(err, res);
      } catch (e) {
        return next(e);
      }
    }
  },
);

authRouter.post(
  "/login",
  requireGuest,
  authRateLimiter,
  validateBody(LoginRequest),
  async (req, res, next) => {
    try {
      const session = await login(req.body);
      setRefreshCookie(res, session.cookie);
      res.status(200).json(session.auth);
    } catch (err) {
      try {
        return handleAuthError(err, res);
      } catch (e) {
        return next(e);
      }
    }
  },
);

authRouter.post("/refresh", authRateLimiter, async (req, res, next) => {
  try {
    const cookie = parseRefreshCookie(req.cookies?.[REFRESH_COOKIE_NAME]);
    try {
      const session = await refresh(cookie);
      setRefreshCookie(res, session.cookie);
      res.status(200).json(session.auth);
    } catch (err) {
      if (err instanceof AuthError) {
        clearRefreshCookie(res);
        return res
          .status(err.status)
          .json({ error: { code: err.code, message: "Session expired" } });
      }
      throw err;
    }
  } catch (err) {
    next(err);
  }
});

authRouter.post("/logout", requireAuth, async (req: AuthedRequest, res, next) => {
  try {
    const cookie = parseRefreshCookie(req.cookies?.[REFRESH_COOKIE_NAME]);
    await logout(cookie);
    clearRefreshCookie(res);
    res.status(200).json({ ok: true });
  } catch (err) {
    next(err);
  }
});

authRouter.patch(
  "/password",
  requireAuth,
  authRateLimiter,
  validateBody(ChangePasswordRequest),
  async (req: AuthedRequest, res, next) => {
    try {
      if (!req.user) {
        return res
          .status(401)
          .json({ error: { code: "UNAUTHENTICATED", message: "Authentication required" } });
      }
      await changePassword({ userId: req.user.id, ...req.body });
      res.status(200).json({ ok: true });
    } catch (err) {
      try {
        return handleAuthError(err, res);
      } catch (e) {
        return next(e);
      }
    }
  },
);
