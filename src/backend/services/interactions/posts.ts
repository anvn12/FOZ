import type { CreatePostRequest, UpdatePostRequest } from "#shared/schemas/interactions.js";
import { db } from "#backend/db/client.js";
import { posts, postAttachments } from "#backend/db/schema/interactions.js";
import { and, eq, inArray, isNotNull, isNull } from "drizzle-orm";
import {
  getPostById, listPosts, countReactionsForTarget, countCommentsForPost, getReaction,
  listPostsWithEngagement, getViewerReactions, getViewerComments, buildPostAuthorMap,
} from "#backend/db/repositories/interactions.js";
import { getProfileByUserId } from "#backend/api/profile/profile.service.js";
import { rankPosts, buildViewerInteractionMap, type RankedPost } from "#backend/services/interactions/feed-ranking.js";

export async function createPost(authorId: string, input: CreatePostRequest) {
  const postsToCreate = ('posts' in input && Array.isArray(input.posts)) ? input.posts : [input];
  const createdPosts: any[] = [];

  return await db.transaction(async (tx) => {
    let lastPostId: string | null = null;
    
    for (let i = 0; i < postsToCreate.length; i++) {
      const postInput: any = postsToCreate[i];
      if (!postInput) continue;
      
      const parentId: string | null = (i === 0 ? postInput.parentId : lastPostId) || null;
      
      const [postRow]: any[] = await tx
        .insert(posts)
        .values({
          authorId,
          content: postInput.content || null,
          parentId: parentId || null,
          visibilityState: "public",
          lifecycleState: "active",
        })
        .returning();
      
      lastPostId = postRow.id;
      
      let attachments: any[] = [];
      if (postInput.attachments && postInput.attachments.length > 0) {
        attachments = await tx
          .insert(postAttachments)
          .values(
            postInput.attachments.map((att: any) => ({
              postId: postRow.id,
              fileUrl: att.fileUrl,
              fileType: att.fileType,
              fileSize: att.fileSize,
            }))
          )
          .returning();
      }
      
      createdPosts.push({
        ...postRow,
        commentCount: 0,
        attachments,
      });
    }
    
    return ('posts' in input) ? createdPosts : createdPosts[0];
  });
}

export async function updatePostBody(postId: string, authorId: string, input: UpdatePostRequest) {
  const [row] = await db
    .update(posts)
    .set({ content: input.content, updatedAt: new Date() })
    .where(and(eq(posts.id, postId), eq(posts.authorId, authorId), isNull(posts.deletedAt)))
    .returning();
  if (!row) {
    const existing = await getPostById(postId);
    if (!existing) throw new Error("POST_NOT_FOUND");
    throw new Error("POST_FORBIDDEN");
  }
  return row;
}

export async function deletePost(postId: string, userId: string, isAdmin: boolean) {
  const existing = await getPostById(postId);
  if (!existing) throw new Error("POST_NOT_FOUND");
  if (existing.authorId !== userId && !isAdmin) {
    throw new Error("POST_FORBIDDEN");
  }
  
  const [row] = await db
    .delete(posts)
    .where(eq(posts.id, postId))
    .returning();
    
  return { ok: true as const };
}

export async function createRepost(authorId: string, repostOfId: string) {
  const existingPost = await getPostById(repostOfId);
  if (!existingPost || existingPost.visibilityState !== "public") {
    throw new Error("POST_NOT_FOUND");
  }

  // Check if already reposted
  const existingReposts = await db.select().from(posts).where(and(eq(posts.authorId, authorId), eq(posts.repostOfId, repostOfId)));
  if (existingReposts.length > 0) return existingReposts[0];

  const [row] = await db.insert(posts).values({
    authorId,
    repostOfId,
    visibilityState: "public",
    lifecycleState: "active",
  }).returning();

  return row;
}

export async function removeRepost(authorId: string, repostOfId: string) {
  const [row] = await db.delete(posts).where(and(eq(posts.authorId, authorId), eq(posts.repostOfId, repostOfId))).returning();
  if (!row) throw new Error("POST_NOT_FOUND");
  return { ok: true as const };
}

export async function listPostFeed(viewerId?: string, authorId?: string) {
  const rows = await listPosts(authorId);
  const enriched = [] as Array<any>;
  for (const row of rows) {
    let postToEnrich = row;
    let originalAuthor = undefined;
    
    // If this is a repost, we show the original post but mark it as a repost
    if (row.repostOfId) {
      const original = await getPostById(row.repostOfId);
      if (original) {
        postToEnrich = { ...(original as any), repostId: row.id, createdAt: row.createdAt };
        const profile = await getProfileByUserId(row.authorId);
        originalAuthor = profile ? {
          id: profile.userAccountId,
          displayName: profile.displayName || `Member ${profile.userAccountId.slice(0, 4)}`,
        } : undefined;
      } else {
        continue; // Original post was deleted
      }
    }

    const atts = await db.select().from(postAttachments).where(eq(postAttachments.postId, postToEnrich.id));
    
    // Check if the current user has reposted this
    let reposted = false;
    if (viewerId) {
      const reposts = await db.select().from(posts).where(and(eq(posts.authorId, viewerId), eq(posts.repostOfId, postToEnrich.id)));
      reposted = reposts.length > 0;
    }

    enriched.push({
      ...postToEnrich,
      likeCount: await countReactionsForTarget("post", postToEnrich.id),
      commentCount: await countCommentsForPost(postToEnrich.id),
      liked: viewerId ? Boolean(await getReaction({ userAccountId: viewerId, targetType: "post", targetId: postToEnrich.id })) : false,
      reposted,
      repostedBy: originalAuthor,
      attachments: atts,
    });
  }
  return enriched;
}

/**
 * Replace repost rows with their original post's content, keeping the repost's
 * id as repostId and its createdAt for recency. Mirrors listPostFeed's unwrap
 * so ranked feeds don't render blank repost shells.
 */
async function unwrapReposts(rows: any[]) {
  const byId = new Map(rows.map((r) => [r.id, r]));
  const repostOfIds = rows.filter((r) => r.repostOfId).map((r) => r.repostOfId);
  const originals = repostOfIds.length
    ? await db.select().from(posts).where(inArray(posts.id, repostOfIds))
    : [];
  const origMap = new Map(originals.map((o) => [o.id, o]));

  const out = [] as any[];
  for (const row of rows) {
    if (!row.repostOfId) {
      out.push(row);
      continue;
    }
    const original = origMap.get(row.repostOfId);
    if (!original || original.deletedAt || original.visibilityState !== "public") continue;
    const origCounts = byId.get(original.id);
    const profile = await getProfileByUserId(row.authorId);
    out.push({
      ...original,
      likeCount: origCounts?.likeCount ?? 0,
      commentCount: origCounts?.commentCount ?? 0,
      repostCount: origCounts?.repostCount ?? 0,
      createdAt: row.createdAt,
      repostId: row.id,
      repostedBy: profile
        ? { id: profile.userAccountId, displayName: profile.displayName || `Member ${profile.userAccountId.slice(0, 4)}` }
        : undefined,
    });
  }
  return out;
}

/**
 * Personalized "For You" feed.
 * Scores posts by viewer affinity, engagement, and recency.
 * Falls back to popularity on cold start (viewer has no interactions).
 */
export async function listForYouFeed(
  viewerId: string,
  limit = 20,
  cursor?: string,
) {
  // Fetch all active posts with engagement counts (single query), unwrap reposts
  const allPosts = await unwrapReposts(await listPostsWithEngagement());

  // Batch-fetch viewer's interaction history
  const viewerReactions = await getViewerReactions(viewerId, allPosts.map((p) => p.id));
  const viewerComments = await getViewerComments(viewerId, allPosts.map((p) => p.id));
  const postAuthorMap = buildPostAuthorMap(allPosts);
  const interactionMap = buildViewerInteractionMap(viewerReactions, viewerComments, postAuthorMap);

  // Score and rank
  const ranked = rankPosts(allPosts as RankedPost[], interactionMap);

  // Build sets of post IDs the viewer has liked / reposted
  const likedPostIds = new Set(
    viewerReactions.filter((r) => r.targetType === "post").map((r) => r.targetId),
  );
  const viewerRepostRows = await db
    .select({ repostOfId: posts.repostOfId })
    .from(posts)
    .where(and(eq(posts.authorId, viewerId), isNotNull(posts.repostOfId), isNull(posts.deletedAt)));
  const repostedIds = new Set(viewerRepostRows.map((r) => r.repostOfId));

  // Apply cursor pagination (filter posts created before cursor)
  let filtered = ranked;
  if (cursor) {
    const cursorDate = new Date(cursor).getTime();
    filtered = ranked.filter((p) => new Date(p.createdAt).getTime() < cursorDate);
  }

  const items: Array<RankedPost & { liked: boolean; reposted: boolean }> = filtered
    .slice(0, limit)
    .map((p) => ({ ...p, liked: likedPostIds.has(p.id), reposted: repostedIds.has(p.id) }));
  const nextCursor = items.length === limit
    ? new Date(items[items.length - 1]!.createdAt).toISOString()
    : null;

  return { items, nextCursor };
}

/**
 * Popular feed for guests / cold-start.
 * Scores by engagement + recency only (no affinity).
 */
export async function listPopularFeed(limit = 20, cursor?: string) {
  const allPosts = await unwrapReposts(await listPostsWithEngagement());

  // Score with empty interaction map → popularity only
  const ranked = rankPosts(allPosts as RankedPost[], new Map());

  let filtered = ranked;
  if (cursor) {
    const cursorDate = new Date(cursor).getTime();
    filtered = ranked.filter((p) => new Date(p.createdAt).getTime() < cursorDate);
  }

  const items: Array<RankedPost & { liked: boolean; reposted: boolean }> = filtered
    .slice(0, limit)
    .map((p) => ({ ...p, liked: false, reposted: false }));
  const nextCursor = items.length === limit
    ? new Date(items[items.length - 1]!.createdAt).toISOString()
    : null;

  return { items, nextCursor };
}
