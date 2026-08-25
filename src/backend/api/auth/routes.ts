import { Router, type RequestHandler } from "express";
import { RegisterRequest, LoginRequest, ChangePasswordRequest, usernameSchema } from "#shared/schemas/auth.js";
import { authRateLimiter, registerRateLimiter, loginRateLimiter } from "#backend/lib/rate-limit.js";
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
import { getUserById, checkUsernameAvailable } from "#backend/db/repositories/users.js";
import { googleAuthRouter } from "./google-auth.routes.js";

export const authRouter: Router = Router();
authRouter.use(googleAuthRouter);

// GET /api/v1/auth/me — returns the authenticated user from a Bearer token.
// Used by the OAuth redirect flow to exchange an access token for a full user object.
authRouter.get("/me", requireAuth, async (req: AuthedRequest, res, next) => {
  try {
    const userId = req.user?.id;
    if (!userId) {
      return res.status(401).json({ error: { code: "UNAUTHENTICATED", message: "Authentication required" } });
    }
    const user = await getUserById(userId);
    if (!user) {
      return res.status(401).json({ error: { code: "UNAUTHENTICATED", message: "Authentication required" } });
    }
    return res.status(200).json({
      user: { id: user.id, email: user.email, username: user.username, role: user.role, status: user.status },
    });
  } catch (err) {
    next(err);
  }
});

// GET /api/v1/auth/check-username?username=...
authRouter.get("/check-username", authRateLimiter, async (req, res, next) => {
  try {
    const rawUsername = typeof req.query.username === "string" ? req.query.username : "";
    const parsed = usernameSchema.safeParse(rawUsername);
    if (!parsed.success) {
      const issue = parsed.error.issues[0];
      return res.status(200).json({
        available: false,
        reason: issue?.message || "Invalid username format",
      });
    }
    const available = await checkUsernameAvailable(parsed.data);
    if (!available) {
      return res.status(200).json({
        available: false,
        reason: "This username is already taken",
      });
    }
    return res.status(200).json({ available: true, reason: null });
  } catch (err) {
    next(err);
  }
});


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
  if (err instanceof AuthError || (err && typeof err === "object" && "code" in err && "status" in err)) {
    const authErr = err as { code: string; status: number };
    return res.status(authErr.status).json({
      error: {
        code: authErr.code,
        message:
          authErr.code === "INCORRECT_CURRENT_PASSWORD"
            ? "Incorrect current password"
            : authErr.code === "USERNAME_TAKEN"
              ? "This username is already taken"
              : authErr.code === "EMAIL_TAKEN"
                ? "An account with this email already exists"
                : authErr.code === "INVALID_CREDENTIALS"
                  ? "Invalid email or password"
                  : authErr.code === "ACCOUNT_NOT_ACTIVE"
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
  registerRateLimiter,
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
  loginRateLimiter,
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

authRouter.post("/logout", async (req, res, next) => {
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
