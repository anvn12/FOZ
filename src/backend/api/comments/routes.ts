import { Router } from "express";
import { optionalAuth, requireAuth, validateBody, type AuthedRequest } from "#backend/api/auth/middleware.js";
import { createCommentRequestSchema, updateCommentRequestSchema } from "#shared/schemas/interactions.js";
import { createComment, updateCommentBody, deleteComment, listComments, listAuthorComments } from "#backend/services/interactions/comments.js";

export const commentRouter = Router();

commentRouter.post(
  "/posts/:postId/comments",
  requireAuth,
  validateBody(createCommentRequestSchema),
  async (req: AuthedRequest, res, next) => {
    try {
      if (!req.user) {
        return res.status(401).json({ error: { code: "UNAUTHENTICATED", message: "Authentication required" } });
      }
      const postId = req.params.postId as string;
      const comment = await createComment({ authorId: req.user.id, postId, ...req.body });
      return res.status(201).json(comment);
    } catch (err) {
      if (err instanceof Error && (err.message === "POST_NOT_FOUND" || err.message === "PARENT_COMMENT_NOT_FOUND")) {
        return res.status(404).json({ error: { code: "NOT_FOUND", message: "The discussion is no longer available" } });
      }
      next(err);
    }
  },
);

commentRouter.get("/posts/:postId/comments", optionalAuth, async (req: AuthedRequest, res, next) => {
  try {
    const postId = req.params.postId as string;
    return res.status(200).json({ items: await listComments(postId, req.user?.id) });
  } catch (err) {
    if (err instanceof Error && err.message === "POST_NOT_FOUND") {
      return res.status(404).json({ error: { code: "NOT_FOUND", message: "Post not found" } });
    }
    next(err);
  }
});

commentRouter.get("/comments", optionalAuth, async (req: AuthedRequest, res, next) => {
  try {
    const authorId = req.query.authorId as string | undefined;
    if (!authorId) {
      return res.status(400).json({ error: { code: "BAD_REQUEST", message: "authorId is required" } });
    }
    return res.status(200).json({ items: await listAuthorComments(authorId, req.user?.id) });
  } catch (err) {
    next(err);
  }
});

commentRouter.patch(
  "/comments/:commentId",
  requireAuth,
  validateBody(updateCommentRequestSchema),
  async (req: AuthedRequest, res, next) => {
    try {
      if (!req.user) {
        return res.status(401).json({ error: { code: "UNAUTHENTICATED", message: "Authentication required" } });
      }
      const commentId = req.params.commentId as string;
      const comment = await updateCommentBody(commentId, req.user.id, req.body);
      return res.status(200).json(comment);
    } catch (err) {
      if (err instanceof Error && err.message === "COMMENT_NOT_FOUND") {
        return res.status(404).json({ error: { code: "NOT_FOUND", message: "Comment not found" } });
      }
      if (err instanceof Error && err.message === "COMMENT_FORBIDDEN") {
        return res.status(403).json({ error: { code: "FORBIDDEN", message: "You do not own this comment" } });
      }
      next(err);
    }
  },
);

  commentRouter.delete("/comments/:commentId", requireAuth, async (req: AuthedRequest, res, next) => {
  try {
    if (!req.user) {
      return res.status(401).json({ error: { code: "UNAUTHENTICATED", message: "Authentication required" } });
    }
      const commentId = req.params.commentId as string;
      await deleteComment(commentId, req.user.id);
    return res.status(200).json({ ok: true });
  } catch (err) {
      if (err instanceof Error && err.message === "COMMENT_NOT_FOUND") {
        return res.status(404).json({ error: { code: "NOT_FOUND", message: "Comment not found" } });
      }
      if (err instanceof Error && err.message === "COMMENT_FORBIDDEN") {
        return res.status(403).json({ error: { code: "FORBIDDEN", message: "You do not own this comment" } });
      }
    next(err);
  }
});
