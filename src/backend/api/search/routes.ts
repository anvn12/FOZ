import { Router } from "express";
import { z } from "zod";
import { ilike, eq, and, desc, sql } from "drizzle-orm";
import { db } from "#backend/db/client.js";
import { posts, profiles, userAccounts, reactions, comments } from "#backend/db/schema/index.js";
import { SearchDiscoveryQuerySchema } from "#shared/schemas/search.js";

const SearchQuerySchema = z.object({
  q: z
    .string()
    .trim()
    .min(1, "Query is required")
    .max(100, "Query must be at most 100 characters"),
  type: z.enum(["posts", "users", "all"]).optional().default("all"),
});

const router = Router();

router.get("/discovery", async (req, res, next) => {
  try {
    const { limit } = SearchDiscoveryQuerySchema.parse(req.query);
    const maxLimit = Math.min(limit, 10);

    // 1. Suggested Creators: Top 10 most active creators ordered by active post count
    const rawCreators = await db
      .select({
        id: profiles.id,
        userAccountId: profiles.userAccountId,
        displayName: profiles.displayName,
        bio: profiles.bio,
        avatarUrl: profiles.avatarUrl,
      })
      .from(profiles)
      .innerJoin(userAccounts, eq(profiles.userAccountId, userAccounts.id))
      .where(eq(userAccounts.status, "active"))
      .orderBy(
        desc(
          sql`(SELECT COUNT(*)::int FROM ${posts} WHERE ${posts.authorId} = ${profiles.userAccountId} AND ${posts.lifecycleState} = 'active')`
        ),
        desc(profiles.createdAt)
      )
      .limit(maxLimit);

    // 2. Trending Discussions: Top 10 active public posts ordered by total engagement (likes + comments)
    const activePosts = await db
      .select({
        id: posts.id,
        authorId: posts.authorId,
        content: posts.content,
        createdAt: posts.createdAt,
        displayName: profiles.displayName,
        avatarUrl: profiles.avatarUrl,
      })
      .from(posts)
      .innerJoin(profiles, eq(posts.authorId, profiles.userAccountId))
      .innerJoin(userAccounts, eq(posts.authorId, userAccounts.id))
      .where(
        and(
          eq(posts.lifecycleState, "active"),
          eq(posts.visibilityState, "public"),
          eq(userAccounts.status, "active")
        )
      )
      .orderBy(
        desc(
          sql`(
            (SELECT COUNT(*)::int FROM ${reactions} WHERE ${reactions.targetType} = 'post' AND ${reactions.targetId} = ${posts.id}) +
            (SELECT COUNT(*)::int FROM ${comments} WHERE ${comments.postId} = ${posts.id} AND ${comments.lifecycleState} = 'active')
          )`
        ),
        desc(posts.createdAt)
      )
      .limit(maxLimit);

    const discussions = await Promise.all(
      activePosts.map(async (p) => {
        // Fetch like count
        const [likeRes] = await db
          .select({ count: sql<number>`count(*)::int` })
          .from(reactions)
          .where(and(eq(reactions.targetType, "post"), eq(reactions.targetId, p.id)));

        // Fetch comment count
        const [commentRes] = await db
          .select({ count: sql<number>`count(*)::int` })
          .from(comments)
          .where(and(eq(comments.postId, p.id), eq(comments.lifecycleState, "active")));

        const authorHandle = `@${(p.displayName || "user").toLowerCase().replace(/\s+/g, "")}`;

        return {
          id: p.id,
          authorId: p.authorId,
          authorName: p.displayName || "Anonymous",
          authorHandle,
          authorAvatarUrl: p.avatarUrl,
          content: p.content || "",
          createdAt: p.createdAt ? p.createdAt.toISOString() : new Date().toISOString(),
          likeCount: likeRes?.count ?? 0,
          commentCount: commentRes?.count ?? 0,
        };
      })
    );

    // 3. Trending Topics: Extracted tags or defaults
    const defaultTopics = [
      { id: "t1", name: "Design Systems", tag: "#DesignSystems" },
      { id: "t2", name: "AI Architecture", tag: "AI Architecture" },
      { id: "t3", name: "Minimalism", tag: "#Minimalism" },
      { id: "t4", name: "UI Engineering", tag: "UI Engineering" },
      { id: "t5", name: "Future of Work", tag: "Future of Work" },
    ];

    res.json({
      topics: defaultTopics,
      creators: rawCreators,
      discussions,
    });
  } catch (err) {
    next(err);
  }
});

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
        .orderBy(desc(posts.createdAt))
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
