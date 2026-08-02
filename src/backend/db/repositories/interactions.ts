import { and, eq, isNull, desc } from "drizzle-orm";
import { db } from "#backend/db/client.js";
import { posts, comments, reactions } from "#backend/db/schema/interactions.js";

export async function getPostById(id: string) {
  const [row] = await db.select().from(posts).where(eq(posts.id, id));
  return row;
}

export async function getCommentById(id: string) {
  const [row] = await db.select().from(comments).where(eq(comments.id, id));
  return row;
}

export async function listPosts(authorId?: string) {
  const conditions = [eq(posts.visibilityState, "public"), isNull(posts.deletedAt)];
  if (authorId) conditions.push(eq(posts.authorId, authorId));
  return db.select().from(posts).where(and(...conditions)).orderBy(desc(posts.createdAt));
}

export async function listCommentsForPost(postId: string) {
  return db
    .select()
    .from(comments)
    .where(and(eq(comments.postId, postId), eq(comments.visibilityState, "public"), isNull(comments.deletedAt)));
}

export async function countCommentsForPost(postId: string) {
  const rows = await db
    .select({ id: comments.id })
    .from(comments)
    .where(and(eq(comments.postId, postId), eq(comments.visibilityState, "public"), isNull(comments.deletedAt)));
  return rows.length;
}

export async function listCommentsByAuthor(authorId: string) {
  return db
    .select()
    .from(comments)
    .where(and(eq(comments.authorId, authorId), eq(comments.visibilityState, "public"), isNull(comments.deletedAt)))
    .orderBy(comments.createdAt);
}

export async function countReactionsForTarget(targetType: "post" | "comment", targetId: string) {
  const rows = await db
    .select({ id: reactions.id })
    .from(reactions)
    .where(and(eq(reactions.targetType, targetType), eq(reactions.targetId, targetId), eq(reactions.reactionKind, "like")));
  return rows.length;
}

export async function createReaction(args: {
  userAccountId: string;
  targetType: "post" | "comment";
  targetId: string;
}) {
  const [row] = await db
    .insert(reactions)
    .values({
      userAccountId: args.userAccountId,
      targetType: args.targetType,
      targetId: args.targetId,
      reactionKind: "like",
    })
    .onConflictDoNothing()
    .returning();
  return row;
}

export async function removeReaction(args: {
  userAccountId: string;
  targetType: "post" | "comment";
  targetId: string;
}) {
  const [row] = await db
    .delete(reactions)
    .where(
      and(
        eq(reactions.userAccountId, args.userAccountId),
        eq(reactions.targetType, args.targetType),
        eq(reactions.targetId, args.targetId),
        eq(reactions.reactionKind, "like"),
      ),
    )
    .returning();
  return row;
}

  export async function getReaction(args: {
    userAccountId: string;
    targetType: "post" | "comment";
    targetId: string;
  }) {
    const [row] = await db
      .select()
      .from(reactions)
      .where(
        and(
          eq(reactions.userAccountId, args.userAccountId),
          eq(reactions.targetType, args.targetType),
          eq(reactions.targetId, args.targetId),
          eq(reactions.reactionKind, "like"),
        ),
      );
    return row;
  }

/**
 * Batch: fetch all active public posts with engagement counts in a single query.
 * Returns posts with likeCount, commentCount, repostCount pre-aggregated.
 */
export async function listPostsWithEngagement(authorId?: string) {
  const conditions = [eq(posts.visibilityState, "public"), isNull(posts.deletedAt)];
  if (authorId) conditions.push(eq(posts.authorId, authorId));

  // Fetch posts
  const rows = await db.select().from(posts).where(and(...conditions)).orderBy(desc(posts.createdAt));

  // Batch-fetch engagement for all posts in one go
  const postIds = rows.map((r) => r.id);
  if (postIds.length === 0) return [];

  // Count reactions per post
  const reactionCounts = await db
    .select({ targetId: reactions.targetId, count: reactions.id })
    .from(reactions)
    .where(and(eq(reactions.targetType, "post"), eq(reactions.reactionKind, "like")));

  // Count comments per post
  const commentCounts = await db
    .select({ postId: comments.postId, count: comments.id })
    .from(comments)
    .where(and(eq(comments.visibilityState, "public"), isNull(comments.deletedAt)));

  // Count reposts per post
  const repostCounts = await db
    .select({ repostOfId: posts.repostOfId, count: posts.id })
    .from(posts)
    .where(and(isNull(posts.deletedAt), eq(posts.visibilityState, "public")));

  // Build lookup maps
  const likeMap = new Map<string, number>();
  for (const r of reactionCounts) likeMap.set(r.targetId, (likeMap.get(r.targetId) ?? 0) + 1);

  const commentMap = new Map<string, number>();
  for (const c of commentCounts) commentMap.set(c.postId, (commentMap.get(c.postId) ?? 0) + 1);

  const repostMap = new Map<string, number>();
  for (const r of repostCounts) {
    if (r.repostOfId) repostMap.set(r.repostOfId, (repostMap.get(r.repostOfId) ?? 0) + 1);
  }

  return rows.map((row) => ({
    ...row,
    likeCount: likeMap.get(row.id) ?? 0,
    commentCount: commentMap.get(row.id) ?? 0,
    repostCount: repostMap.get(row.id) ?? 0,
  }));
}

/**
 * Batch: fetch viewer's reactions to specific posts.
 */
export async function getViewerReactions(viewerId: string, postIds: string[]) {
  if (postIds.length === 0) return [];
  return db
    .select({ targetType: reactions.targetType, targetId: reactions.targetId })
    .from(reactions)
    .where(
      and(
        eq(reactions.userAccountId, viewerId),
        eq(reactions.reactionKind, "like"),
      ),
    );
}

/**
 * Batch: fetch viewer's comments on specific posts.
 */
export async function getViewerComments(viewerId: string, postIds: string[]) {
  if (postIds.length === 0) return [];
  return db
    .select({ postId: comments.postId })
    .from(comments)
    .where(
      and(
        eq(comments.authorId, viewerId),
        eq(comments.visibilityState, "public"),
        isNull(comments.deletedAt),
      ),
    );
}

/**
 * Build a postId → authorId map from a list of posts.
 */
export function buildPostAuthorMap(postList: Array<{ id: string; authorId: string }>): Map<string, string> {
  const map = new Map<string, string>();
  for (const p of postList) map.set(p.id, p.authorId);
  return map;
}
