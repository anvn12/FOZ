import { and, eq, isNull, sql } from "drizzle-orm";
import { db } from "#backend/db/client.js";
import { comments, postSummaries, reactions, type NewPostSummary, type PostSummary } from "#backend/db/schema/interactions.js";

export async function getPostSummaryByPostId(postId: string): Promise<PostSummary | undefined> {
  const [row] = await db
    .select()
    .from(postSummaries)
    .where(eq(postSummaries.postId, postId));
  return row;
}

export async function upsertPostSummary(data: Omit<NewPostSummary, "id" | "createdAt" | "updatedAt">): Promise<PostSummary> {
  const [existing] = await db
    .select()
    .from(postSummaries)
    .where(eq(postSummaries.postId, data.postId));

  if (existing) {
    const [updated] = await db
      .update(postSummaries)
      .set({
        postSnapshot: data.postSnapshot,
        keyHighlights: data.keyHighlights,
        sentiment: data.sentiment,
        commentCount: data.commentCount,
        updatedAt: new Date(),
      })
      .where(eq(postSummaries.id, existing.id))
      .returning();
    return updated;
  }

  const [inserted] = await db
    .insert(postSummaries)
    .values({
      postId: data.postId,
      postSnapshot: data.postSnapshot,
      keyHighlights: data.keyHighlights,
      sentiment: data.sentiment,
      commentCount: data.commentCount,
    })
    .returning();
  return inserted;
}

export async function getSampledCommentsForSummary(postId: string): Promise<Array<{ id: string; body: string }>> {
  const activeComments = await db
    .select()
    .from(comments)
    .where(
      and(
        eq(comments.postId, postId),
        eq(comments.visibilityState, "public"),
        isNull(comments.deletedAt),
      ),
    );

  if (activeComments.length <= 10) {
    return activeComments.map((c) => ({ id: c.id, body: c.body }));
  }

  // Get reaction counts for comments on this post
  const reactionRows = await db
    .select({
      commentId: reactions.targetId,
      likeCount: sql<number>`count(*)::int`,
    })
    .from(reactions)
    .where(and(eq(reactions.targetType, "comment"), eq(reactions.reactionKind, "like")))
    .groupBy(reactions.targetId);

  const likeMap = new Map<string, number>();
  for (const r of reactionRows) {
    likeMap.set(r.commentId, r.likeCount);
  }

  // Get direct 1st-level child reply counts
  const childReplyRows = await db
    .select({
      parentCommentId: comments.parentCommentId,
      replyCount: sql<number>`count(*)::int`,
    })
    .from(comments)
    .where(and(eq(comments.postId, postId), isNull(comments.deletedAt)))
    .groupBy(comments.parentCommentId);

  const replyMap = new Map<string, number>();
  for (const cr of childReplyRows) {
    if (cr.parentCommentId) {
      replyMap.set(cr.parentCommentId, cr.replyCount);
    }
  }

  const selectedSet = new Set<string>();
  const sampled: Array<{ id: string; body: string }> = [];

  // 1. Top 4 Most Liked
  const sortedByLikes = [...activeComments].sort(
    (a, b) => (likeMap.get(b.id) || 0) - (likeMap.get(a.id) || 0),
  );
  for (const c of sortedByLikes) {
    if (sampled.length >= 4) break;
    if (!selectedSet.has(c.id)) {
      selectedSet.add(c.id);
      sampled.push({ id: c.id, body: c.body });
    }
  }

  // 2. Top 3 Most Replied (direct 1st level)
  const sortedByReplies = [...activeComments].sort(
    (a, b) => (replyMap.get(b.id) || 0) - (replyMap.get(a.id) || 0),
  );
  for (const c of sortedByReplies) {
    if (sampled.length >= 7) break;
    if (!selectedSet.has(c.id)) {
      selectedSet.add(c.id);
      sampled.push({ id: c.id, body: c.body });
    }
  }

  // 3. Top 3 Most Recent
  const sortedByRecent = [...activeComments].sort(
    (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
  );
  for (const c of sortedByRecent) {
    if (sampled.length >= 10) break;
    if (!selectedSet.has(c.id)) {
      selectedSet.add(c.id);
      sampled.push({ id: c.id, body: c.body });
    }
  }

  return sampled;
}
