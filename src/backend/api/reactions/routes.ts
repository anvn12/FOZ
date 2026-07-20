import { Router } from "express";
import { requireAuth, type AuthedRequest } from "#backend/api/auth/middleware.js";
import { likeTarget, unlikeTarget } from "#backend/services/interactions/reactions.js";

export const reactionRouter = Router();

reactionRouter.post("/posts/:postId/reaction", requireAuth, async (req: AuthedRequest, res, next) => {
  try {
    if (!req.user) {
      return res.status(401).json({ error: { code: "UNAUTHENTICATED", message: "Authentication required" } });
    }
    const postId = req.params.postId as string;
    return res.status(200).json(
      await likeTarget({ userAccountId: req.user.id, targetType: "post", targetId: postId }),
    );
  } catch (err) {
    if (err instanceof Error && err.message === "TARGET_NOT_FOUND") {
      return res.status(404).json({ error: { code: "NOT_FOUND", message: "Target not found" } });
    }
    next(err);
  }
});

reactionRouter.delete("/posts/:postId/reaction", requireAuth, async (req: AuthedRequest, res, next) => {
  try {
    if (!req.user) {
      return res.status(401).json({ error: { code: "UNAUTHENTICATED", message: "Authentication required" } });
    }
    const postId = req.params.postId as string;
    return res.status(200).json(
      await unlikeTarget({ userAccountId: req.user.id, targetType: "post", targetId: postId }),
    );
  } catch (err) {
    if (err instanceof Error && err.message === "TARGET_NOT_FOUND") {
      return res.status(404).json({ error: { code: "NOT_FOUND", message: "Target not found" } });
    }
    next(err);
  }
});

reactionRouter.post("/comments/:commentId/reaction", requireAuth, async (req: AuthedRequest, res, next) => {
  try {
    if (!req.user) {
      return res.status(401).json({ error: { code: "UNAUTHENTICATED", message: "Authentication required" } });
    }
    const commentId = req.params.commentId as string;
    return res.status(200).json(
      await likeTarget({ userAccountId: req.user.id, targetType: "comment", targetId: commentId }),
    );
  } catch (err) {
    if (err instanceof Error && err.message === "TARGET_NOT_FOUND") {
      return res.status(404).json({ error: { code: "NOT_FOUND", message: "Target not found" } });
    }
    next(err);
  }
});

reactionRouter.delete("/comments/:commentId/reaction", requireAuth, async (req: AuthedRequest, res, next) => {
  try {
    if (!req.user) {
      return res.status(401).json({ error: { code: "UNAUTHENTICATED", message: "Authentication required" } });
    }
    const commentId = req.params.commentId as string;
    return res.status(200).json(
      await unlikeTarget({ userAccountId: req.user.id, targetType: "comment", targetId: commentId }),
    );
  } catch (err) {
    if (err instanceof Error && err.message === "TARGET_NOT_FOUND") {
      return res.status(404).json({ error: { code: "NOT_FOUND", message: "Target not found" } });
    }
    next(err);
  }
});