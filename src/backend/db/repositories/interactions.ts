import { and, eq, isNull } from "drizzle-orm";
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
  return db.select().from(posts).where(and(...conditions));
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
