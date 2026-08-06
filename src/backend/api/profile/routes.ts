import { Router } from "express";
import { getProfileByUserId, getProfileByUsername, updateUserProfile, ProfileError } from "./profile.service.js";
import { requireAuth, validateBody, type AuthedRequest } from "#backend/api/auth/middleware.js";
import { UpdateProfileRequest, UpdateAvatarRequest } from "#shared/schemas/profile.js";

export const profileRouter: Router = Router();

function handleProfileError(err: unknown, res: any) {
  if (err instanceof ProfileError) {
    return res.status(err.status).json({
      error: {
        code: err.code,
        message: err.message,
      },
    });
  }
  throw err;
}

profileRouter.get("/by-username/:username", async (req, res, next) => {
  try {
    const { username } = req.params;
    if (!username) {
      return res.status(400).json({
        error: {
          code: "VALIDATION",
          message: "Username is required",
        },
      });
    }
    const profile = await getProfileByUsername(username);
    res.status(200).json({ profile });
  } catch (err) {
    try {
      return handleProfileError(err, res);
    } catch (e) {
      return next(e);
    }
  }
});

profileRouter.get("/:userId", async (req, res, next) => {
  try {
    const { userId } = req.params;
    if (!userId) {
      return res.status(400).json({
        error: {
          code: "VALIDATION",
          message: "User ID is required",
        },
      });
    }
    const profile = await getProfileByUserId(userId);
    res.status(200).json({ profile });
  } catch (err) {
    try {
      return handleProfileError(err, res);
    } catch (e) {
      return next(e);
    }
  }
});

profileRouter.patch(
  "/me",
  requireAuth,
  validateBody(UpdateProfileRequest),
  async (req, res, next) => {
    try {
      const authedReq = req as AuthedRequest;
      const userId = authedReq.user!.id;
      const profile = await updateUserProfile(userId, req.body);
      res.status(200).json({ profile });
    } catch (err) {
      try {
        return handleProfileError(err, res);
      } catch (e) {
        return next(e);
      }
    }
  }
);

profileRouter.post(
  "/me/avatar",
  requireAuth,
  validateBody(UpdateAvatarRequest),
  async (req, res, next) => {
    try {
      const authedReq = req as AuthedRequest;
      const userId = authedReq.user!.id;
      const updated = await updateUserProfile(userId, {
        avatarUrl: req.body.avatar,
      });
      res.status(200).json({ avatarUrl: updated.avatarUrl });
    } catch (err) {
      try {
        return handleProfileError(err, res);
      } catch (e) {
        return next(e);
      }
    }
  }
);
