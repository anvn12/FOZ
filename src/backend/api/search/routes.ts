import { Router } from "express";
import { z } from "zod";
import { ilike, eq, and, or, isNull, desc, sql, inArray } from "drizzle-orm";
import { db } from "#backend/db/client.js";
import { posts, profiles, userAccounts, reactions, comments, hashtags, postHashtags, postAttachments } from "#backend/db/schema/index.js";
import { SearchDiscoveryQuerySchema } from "#shared/schemas/search.js";
import { getTrendingHashtags } from "#backend/db/repositories/hashtags.js";
import { optionalAuth, type AuthedRequest } from "#backend/api/auth/middleware.js";

const SearchQuerySchema = z.object({
  q: z
    .string()
    .trim()
    .min(1, "Query is required")
    .max(100, "Query must be at most 100 characters"),
  type: z.enum(["posts", "users", "hashtags", "all"]).optional().default("all"),
  cursor: z.string().optional(),
});

const router = Router();

router.get("/discovery", optionalAuth, async (req: AuthedRequest, res, next) => {
  try {
    const { limit } = SearchDiscoveryQuerySchema.parse(req.query);
    const maxLimit = Math.min(limit, 10);

    // 1. Suggested Creators: Top 10 most active creators ordered by active post count
    const rawCreators = await db
      .select({
        id: profiles.id,
        userAccountId: profiles.userAccountId,
        username: userAccounts.username,
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
          eq(userAccounts.status, "active"),
          isNull(posts.repostOfId)
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

    const attachmentRows = activePosts.length
      ? await db
          .select()
          .from(postAttachments)
          .where(inArray(postAttachments.postId, activePosts.map((p) => p.id)))
      : [];
    const attachmentMap = new Map<string, typeof attachmentRows>();
    for (const att of attachmentRows) {
      const list = attachmentMap.get(att.postId) ?? [];
      list.push(att);
      attachmentMap.set(att.postId, list);
    }

    const viewerId = req.user?.id;
    let likedPostIds = new Set<string>();
    if (viewerId && activePosts.length > 0) {
      const viewerReactions = await db
        .select({ targetId: reactions.targetId })
        .from(reactions)
        .where(
          and(
            eq(reactions.userAccountId, viewerId),
            eq(reactions.targetType, "post"),
            inArray(reactions.targetId, activePosts.map((p) => p.id))
          )
        );
      likedPostIds = new Set(viewerReactions.map((r) => r.targetId));
    }

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

        // Fetch repost count
        const [repostRes] = await db
          .select({ count: sql<number>`count(*)::int` })
          .from(posts)
          .where(
            and(
              eq(posts.repostOfId, p.id),
              eq(posts.visibilityState, "public"),
              isNull(posts.deletedAt)
            )
          );

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
          repostCount: repostRes?.count ?? 0,
          attachments: attachmentMap.get(p.id) ?? [],
          liked: likedPostIds.has(p.id),
        };
      })
    );

    // 3. Trending Topics: Fetch real trending hashtags from database
    let trendingHashtags = await getTrendingHashtags(maxLimit);

    if (trendingHashtags.length < maxLimit) {
      // Fallback 1: Query overall top hashtags linked to active public posts
      const overallRows = await db
        .select({
          id: hashtags.id,
          name: hashtags.name,
          displayName: hashtags.displayName,
          postCount: sql<number>`count(${postHashtags.postId})::int`,
        })
        .from(hashtags)
        .innerJoin(postHashtags, eq(hashtags.id, postHashtags.hashtagId))
        .innerJoin(posts, eq(postHashtags.postId, posts.id))
        .where(and(eq(posts.visibilityState, "public"), isNull(posts.deletedAt)))
        .groupBy(hashtags.id, hashtags.name, hashtags.displayName)
        .orderBy(desc(sql`count(${postHashtags.postId})`), desc(hashtags.createdAt))
        .limit(maxLimit);

      const existingIds = new Set(trendingHashtags.map((h) => h.id));
      for (const row of overallRows) {
        if (!existingIds.has(row.id) && trendingHashtags.length < maxLimit) {
          trendingHashtags.push(row);
          existingIds.add(row.id);
        }
      }

      // Fallback 2: If still under maxLimit, include any registered hashtags
      if (trendingHashtags.length < maxLimit) {
        const allHashtags = await db
          .select({
            id: hashtags.id,
            name: hashtags.name,
            displayName: hashtags.displayName,
          })
          .from(hashtags)
          .orderBy(desc(hashtags.createdAt))
          .limit(maxLimit);

        for (const h of allHashtags) {
          if (!existingIds.has(h.id) && trendingHashtags.length < maxLimit) {
            trendingHashtags.push({
              id: h.id,
              name: h.name,
              displayName: h.displayName,
              postCount: 0,
            });
            existingIds.add(h.id);
          }
        }
      }
    }

    const topics = trendingHashtags.map((h) => {
      const display = h.displayName || h.name;
      const tag = display.startsWith("#") ? display : `#${display}`;
      return {
        id: h.id,
        name: display,
        tag,
        postCount: h.postCount,
      };
    });

    res.json({
      topics,
      creators: rawCreators,
      discussions,
    });
  } catch (err) {
    next(err);
  }
});

router.get("/", async (req, res, next) => {
  try {
    const { q, type, cursor } = SearchQuerySchema.parse(req.query);
    const pattern = `%${q}%`;
    const offset = Number(cursor) || 0;

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
      username: string;
      displayName: string;
      bio: string | null;
      avatarUrl: string | null;
      location: string | null;
      website: string | null;
      createdAt: Date;
      type: "user";
    }> = [];

    let hashtagItems: Array<{
      id: string;
      name: string;
      displayName: string;
      postCount: number;
      type: "hashtag";
    }> = [];

    if (type === "posts" || type === "all") {
      const matchedPosts = await db
        .select({
          id: posts.id,
          authorId: posts.authorId,
          authorName: profiles.displayName,
          authorUsername: userAccounts.username,
          authorAvatarUrl: profiles.avatarUrl,
          body: posts.content,
          content: posts.content,
          visibilityState: posts.visibilityState,
          lifecycleState: posts.lifecycleState,
          createdAt: posts.createdAt,
        })
        .from(posts)
        .innerJoin(profiles, eq(posts.authorId, profiles.userAccountId))
        .innerJoin(userAccounts, eq(posts.authorId, userAccounts.id))
        .where(
          and(
            ilike(posts.content, pattern),
            eq(posts.lifecycleState, "active"),
            eq(posts.visibilityState, "public"),
            isNull(posts.deletedAt),
            eq(userAccounts.status, "active")
          )
        )
        .orderBy(desc(posts.createdAt))
        .limit(20).offset(offset);

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
          username: userAccounts.username,
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
        .limit(20).offset(offset);

      userItems = matchedUsers.map((u) => ({
        ...u,
        type: "user" as const,
      }));
    }

    if (type === "hashtags" || type === "all") {
      const matchedHashtags = await db
        .select({
          id: hashtags.id,
          name: hashtags.name,
          displayName: hashtags.displayName,
          postCount: sql<number>`count(${postHashtags.postId})::int`,
        })
        .from(hashtags)
        .innerJoin(postHashtags, eq(hashtags.id, postHashtags.hashtagId))
        .innerJoin(posts, eq(postHashtags.postId, posts.id))
        .where(
          and(
            or(ilike(hashtags.name, pattern), ilike(hashtags.displayName, pattern)),
            eq(posts.visibilityState, "public"),
            eq(posts.lifecycleState, "active"),
            isNull(posts.deletedAt)
          )
        )
        .groupBy(hashtags.id, hashtags.name, hashtags.displayName)
        .orderBy(desc(sql`count(${postHashtags.postId})::int`), desc(hashtags.createdAt))
        .limit(20).offset(offset);

      hashtagItems = matchedHashtags.map((h) => ({
        ...h,
        type: "hashtag" as const,
      }));
    }

    let items: Array<
      typeof postItems[number] | typeof userItems[number] | typeof hashtagItems[number]
    > = [];
    if (type === "posts") {
      items = postItems;
    } else if (type === "users") {
      items = userItems;
    } else if (type === "hashtags") {
      items = hashtagItems;
    } else {
      items = [...postItems, ...userItems, ...hashtagItems];
    }

    res.json({
      items,
      nextCursor: items.length === 20 ? (offset + 20).toString() : null,
    });
  } catch (err) {
    next(err);
  }
});

export { router as searchRouter };
