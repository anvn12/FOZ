import { Router } from "express";
import { optionalAuth, requireAuth, validateBody, type AuthedRequest } from "#backend/api/auth/middleware.js";
import { createPostRequestSchema } from "#shared/schemas/interactions.js";
import { createPost, deletePost, listPostFeed, updatePostBody } from "#backend/services/interactions/posts.js";

export const postRouter = Router();

postRouter.post("/", requireAuth, validateBody(createPostRequestSchema), async (req: AuthedRequest, res, next) => {
  try {
    if (!req.user) {
      return res.status(401).json({ error: { code: "UNAUTHENTICATED", message: "Authentication required" } });
    }
    const post = await createPost(req.user.id, req.body);
    return res.status(201).json(post);
  } catch (err) {
    next(err);
  }
});

postRouter.get("/", optionalAuth, async (req: AuthedRequest, res, next) => {
  try {
    return res.status(200).json({ items: await listPostFeed(req.user?.id) });
  } catch (err) {
    next(err);
  }
});

postRouter.patch("/:postId", requireAuth, validateBody(createPostRequestSchema), async (req: AuthedRequest, res, next) => {
  try {
    if (!req.user) {
      return res.status(401).json({ error: { code: "UNAUTHENTICATED", message: "Authentication required" } });
    }
    const postId = req.params.postId as string;
    const post = await updatePostBody(postId, req.user.id, req.body);
    return res.status(200).json(post);
  } catch (err) {
    if (err instanceof Error && err.message === "POST_NOT_FOUND") {
      return res.status(404).json({ error: { code: "NOT_FOUND", message: "Post not found" } });
    }
    if (err instanceof Error && err.message === "POST_FORBIDDEN") {
      return res.status(403).json({ error: { code: "FORBIDDEN", message: "You do not own this post" } });
    }
    next(err);
  }
});

postRouter.delete("/:postId", requireAuth, async (req: AuthedRequest, res, next) => {
  try {
    if (!req.user) {
      return res.status(401).json({ error: { code: "UNAUTHENTICATED", message: "Authentication required" } });
    }
    const postId = req.params.postId as string;
    await deletePost(postId, req.user.id);
    return res.status(200).json({ ok: true });
  } catch (err) {
    if (err instanceof Error && err.message === "POST_NOT_FOUND") {
      return res.status(404).json({ error: { code: "NOT_FOUND", message: "Post not found" } });
    }
    if (err instanceof Error && err.message === "POST_FORBIDDEN") {
      return res.status(403).json({ error: { code: "FORBIDDEN", message: "You do not own this post" } });
    }
    next(err);
  }
});
