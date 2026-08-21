import { and, eq, isNull, sql } from "drizzle-orm";
import { db } from "#backend/db/client.js";
import { comments, postSummaries, reactions, type NewPostSummary, type PostSummary } from "#backend/db/schema/interactions.js";
import { sampleCommentsForSummary } from "#backend/services/post-summary.service.js";

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
    if (!updated) throw new Error("Failed to update post summary");
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
  if (!inserted) throw new Error("Failed to insert post summary");
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

  return sampleCommentsForSummary(activeComments, likeMap, replyMap);
}

