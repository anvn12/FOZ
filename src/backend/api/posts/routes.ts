import { Router } from "express";
import { optionalAuth, requireAuth, validateBody, type AuthedRequest } from "#backend/api/auth/middleware.js";
import { createPostRequestSchema, feedQuerySchema } from "#shared/schemas/interactions.js";
import {
  createPost, deletePost, listPostFeed, updatePostBody, createRepost, removeRepost,
  listForYouFeed, listPopularFeed,
} from "#backend/services/interactions/posts.js";
import { createReport } from "#backend/services/interactions/reports.js";
import { createReportRequestSchema } from "#shared/schemas/interactions.js";
import { getOrGeneratePostSummary } from "#backend/services/post-summary.service.js";
import { summaryRateLimiter } from "#backend/lib/rate-limit.js";



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
    const parsed = feedQuerySchema.safeParse(req.query);
    if (!parsed.success) {
      return res.status(400).json({ error: { code: "INVALID_QUERY", message: parsed.error.issues[0]?.message ?? "Invalid query" } });
    }
    const { type, authorId, cursor, limit } = parsed.data;

    if (type === "for-you") {
      // Personalized feed requires auth; guests get popularity feed
      if (!req.user) {
        const result = await listPopularFeed(limit, cursor);
        return res.status(200).json(result);
      }

      try {
        const result = await listForYouFeed(req.user.id, limit, cursor);
        return res.status(200).json(result);
      } catch {
        // Graceful degradation: personalization failed → fall back to chronological
        const fallback = await listPostFeed(req.user.id, authorId);
        return res.status(200).json({ items: fallback.slice(0, limit), degraded: true });
      }
    }

    // type === "latest" — chronological (existing behavior)
    const items = await listPostFeed(req.user?.id, authorId);
    return res.status(200).json({ items: items.slice(0, limit) });
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
    const isAdmin = req.user.role === "administrator" || req.user.role === "moderator";
    
    await deletePost(postId, req.user.id, isAdmin);
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

postRouter.post("/:postId/repost", requireAuth, async (req: AuthedRequest, res, next) => {
  try {
    if (!req.user) {
      return res.status(401).json({ error: { code: "UNAUTHENTICATED", message: "Authentication required" } });
    }
    const postId = req.params.postId as string;
    const post = await createRepost(req.user.id, postId);
    return res.status(201).json(post);
  } catch (err) {
    if (err instanceof Error && err.message === "POST_NOT_FOUND") {
      return res.status(404).json({ error: { code: "NOT_FOUND", message: "Post not found" } });
    }
    next(err);
  }
});

postRouter.delete("/:postId/repost", requireAuth, async (req: AuthedRequest, res, next) => {
  try {
    if (!req.user) {
      return res.status(401).json({ error: { code: "UNAUTHENTICATED", message: "Authentication required" } });
    }
    const postId = req.params.postId as string;
    await removeRepost(req.user.id, postId);
    return res.status(200).json({ ok: true });
  } catch (err) {
    if (err instanceof Error && err.message === "POST_NOT_FOUND") {
      return res.status(404).json({ error: { code: "NOT_FOUND", message: "Post not found" } });
    }
    next(err);
  }
});

postRouter.post("/:postId/report", requireAuth, validateBody(createReportRequestSchema), async (req: AuthedRequest, res, next) => {
  try {
    if (!req.user) {
      return res.status(401).json({ error: { code: "UNAUTHENTICATED", message: "Authentication required" } });
    }
    const postId = req.params.postId as string;
    const report = await createReport(req.user.id, "post", postId, req.body.reasonType, req.body.details);
    return res.status(201).json(report);
  } catch (err) {
    if (err instanceof Error && err.message === "POST_NOT_FOUND") {
      return res.status(404).json({ error: { code: "NOT_FOUND", message: "Post not found" } });
    }
    next(err);
  }
});

postRouter.get("/:postId/summary", optionalAuth, summaryRateLimiter, async (req: AuthedRequest, res, next) => {
  try {
    const postId = req.params.postId as string;
    const result = await getOrGeneratePostSummary(postId, false);
    return res.status(200).json({
      success: true,
      cached: result.cached,
      summary: result.summary,
    });
  } catch (err) {
    if (err instanceof Error && err.message === "POST_NOT_FOUND") {
      return res.status(404).json({ error: { code: "NOT_FOUND", message: "Post not found" } });
    }
    next(err);
  }
});

postRouter.post("/:postId/summary/refresh", optionalAuth, summaryRateLimiter, async (req: AuthedRequest, res, next) => {
  try {
    const postId = req.params.postId as string;
    const result = await getOrGeneratePostSummary(postId, true);
    return res.status(200).json({
      success: true,
      cached: result.cached,
      summary: result.summary,
    });
  } catch (err) {
    if (err instanceof Error && err.message === "POST_NOT_FOUND") {
      return res.status(404).json({ error: { code: "NOT_FOUND", message: "Post not found" } });
    }
    next(err);
  }
});

