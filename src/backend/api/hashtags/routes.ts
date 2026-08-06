import { Router } from "express";
import { optionalAuth, type AuthedRequest } from "#backend/api/auth/middleware.js";
import { getPostsByHashtag, getTrendingHashtags } from "#backend/db/repositories/hashtags.js";

export const hashtagRouter = Router();

hashtagRouter.get("/trending", async (_req, res, next) => {
  try {
    const items = await getTrendingHashtags(10);
    return res.status(200).json({ items });
  } catch (err) {
    next(err);
  }
});

hashtagRouter.get("/:tag/posts", optionalAuth, async (req: AuthedRequest, res, next) => {
  try {
    const rawTag = req.params.tag;
    const tag = Array.isArray(rawTag) ? rawTag[0] : rawTag;
    if (!tag) {
      return res.status(400).json({ error: { code: "INVALID_TAG", message: "Tag is required" } });
    }
    const cursor = typeof req.query.cursor === "string" ? req.query.cursor : undefined;
    const limit = typeof req.query.limit === "string" ? parseInt(req.query.limit, 10) : 20;

    const result = await getPostsByHashtag(tag, limit, cursor, req.user?.id);
    return res.status(200).json(result);
  } catch (err) {
    next(err);
  }
});
