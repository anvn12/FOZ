import { Router } from "express";
import { z } from "zod";
import { ilike, eq, and } from "drizzle-orm";
import { db } from "#backend/db/client.js";
import { posts, profiles, userAccounts } from "#backend/db/schema/index.js";

const SearchQuerySchema = z.object({
  q: z
    .string()
    .trim()
    .min(1, "Query is required")
    .max(100, "Query must be at most 100 characters"),
  type: z.enum(["posts", "users", "all"]).optional().default("all"),
});

const router = Router();

router.get("/", async (req, res, next) => {
  try {
    const { q, type } = SearchQuerySchema.parse(req.query);
    const pattern = `%${q}%`;

    let postItems: Array<{
      id: string;
      authorId: string;
      body: string | null;
      content: string | null;
      visibilityState: string;
      lifecycleState: string;
      createdAt: Date;
      type: "post";
    }> = [];

    let userItems: Array<{
      id: string;
      userAccountId: string;
      profileId: string;
      displayName: string;
      bio: string | null;
      avatarUrl: string | null;
      location: string | null;
      website: string | null;
      createdAt: Date;
      type: "user";
    }> = [];

    if (type === "posts" || type === "all") {
      const matchedPosts = await db
        .select({
          id: posts.id,
          authorId: posts.authorId,
          body: posts.content,
          content: posts.content,
          visibilityState: posts.visibilityState,
          lifecycleState: posts.lifecycleState,
          createdAt: posts.createdAt,
        })
        .from(posts)
        .where(
          and(
            ilike(posts.content, pattern),
            eq(posts.lifecycleState, "active"),
            eq(posts.visibilityState, "public")
          )
        )
        .limit(20);

      postItems = matchedPosts.map((p) => ({
        ...p,
        type: "post" as const,
      }));
    }

    if (type === "users" || type === "all") {
      const matchedUsers = await db
        .select({
          id: profiles.userAccountId,
          userAccountId: profiles.userAccountId,
          profileId: profiles.id,
          displayName: profiles.displayName,
          bio: profiles.bio,
          avatarUrl: profiles.avatarUrl,
          location: profiles.location,
          website: profiles.website,
          createdAt: profiles.createdAt,
        })
        .from(profiles)
        .innerJoin(userAccounts, eq(profiles.userAccountId, userAccounts.id))
        .where(
          and(
            ilike(profiles.displayName, pattern),
            eq(userAccounts.status, "active")
          )
        )
        .limit(20);

      userItems = matchedUsers.map((u) => ({
        ...u,
        type: "user" as const,
      }));
    }

    let items: Array<typeof postItems[number] | typeof userItems[number]> = [];
    if (type === "posts") {
      items = postItems;
    } else if (type === "users") {
      items = userItems;
    } else {
      items = [...postItems, ...userItems];
    }

    res.json({
      items,
      nextCursor: null,
    });
  } catch (err) {
    next(err);
  }
});

export { router as searchRouter };
