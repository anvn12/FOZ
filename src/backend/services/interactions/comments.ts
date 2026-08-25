import type { CreateCommentRequest, UpdateCommentRequest } from "#shared/schemas/interactions.js";
import { db } from "#backend/db/client.js";
import { comments } from "#backend/db/schema/interactions.js";
import { and, eq, isNull } from "drizzle-orm";
import { getCommentById, getPostById, listCommentsForPost, countReactionsForTarget, getReaction, listCommentsByAuthor } from "#backend/db/repositories/interactions.js";

export async function createComment(args: { authorId: string; postId: string } & CreateCommentRequest) {
  const post = await getPostById(args.postId);
  if (!post || post.visibilityState !== "public" || post.deletedAt) {
    throw new Error("POST_NOT_FOUND");
  }

  if (args.parentCommentId) {
    const parent = await getCommentById(args.parentCommentId);
    if (!parent || parent.postId !== args.postId || parent.visibilityState !== "public" || parent.deletedAt) {
      throw new Error("PARENT_COMMENT_NOT_FOUND");
    }
  }

  const [row] = await db
    .insert(comments)
    .values({
      authorId: args.authorId,
      postId: args.postId,
      parentCommentId: args.parentCommentId ?? null,
      body: args.body,
      visibilityState: "public",
      lifecycleState: "active",
    })
    .returning();
  return row;
}

export async function updateCommentBody(commentId: string, authorId: string, input: UpdateCommentRequest) {
  const [row] = await db
    .update(comments)
    .set({ body: input.body, updatedAt: new Date() })
    .where(and(eq(comments.id, commentId), eq(comments.authorId, authorId), isNull(comments.deletedAt)))
    .returning();
  if (!row) {
    const existing = await getCommentById(commentId);
    if (!existing) throw new Error("COMMENT_NOT_FOUND");
    throw new Error("COMMENT_FORBIDDEN");
  }
  return row;
}

export async function deleteComment(commentId: string, authorId: string, isAdminBypass?: boolean) {
  const whereClause = isAdminBypass
    ? and(eq(comments.id, commentId), isNull(comments.deletedAt))
    : and(eq(comments.id, commentId), eq(comments.authorId, authorId), isNull(comments.deletedAt));

  const [row] = await db
    .update(comments)
    .set({ lifecycleState: "hidden", visibilityState: "hidden", deletedAt: new Date(), updatedAt: new Date() })
    .where(whereClause)
    .returning();
  if (!row) {
    const existing = await getCommentById(commentId);
    if (!existing) throw new Error("COMMENT_NOT_FOUND");
    throw new Error("COMMENT_FORBIDDEN");
  }
  return { ok: true as const };
}

export async function listComments(postId: string, viewerId?: string) {
  const post = await getPostById(postId);
  if (!post || post.visibilityState !== "public" || post.deletedAt) throw new Error("POST_NOT_FOUND");
  const rows = await listCommentsForPost(postId);

  const childrenMap = new Map<string, string[]>();
  for (const row of rows) {
    if (row.parentCommentId) {
      const list = childrenMap.get(row.parentCommentId) || [];
      list.push(row.id);
      childrenMap.set(row.parentCommentId, list);
    }
  }

  const memo = new Map<string, number>();
  const countDescendants = (id: string): number => {
    if (memo.has(id)) return memo.get(id)!;
    const children = childrenMap.get(id) || [];
    let total = children.length;
    for (const childId of children) {
      total += countDescendants(childId);
    }
    memo.set(id, total);
    return total;
  };

  const enriched = [] as Array<(typeof rows)[number] & { likeCount: number; liked: boolean; replyCount: number }>;
  for (const row of rows) {
    enriched.push({
      ...row,
      likeCount: await countReactionsForTarget("comment", row.id),
      liked: viewerId ? Boolean(await getReaction({ userAccountId: viewerId, targetType: "comment", targetId: row.id })) : false,
      replyCount: countDescendants(row.id),
    });
  }
  return enriched;
}

export async function listAuthorComments(authorId: string, viewerId?: string) {
  const rows = await listCommentsByAuthor(authorId);
  const postCommentsCache = new Map<string, Map<string, number>>();

  const enriched = [] as Array<(typeof rows)[number] & { likeCount: number; liked: boolean; replyCount: number }>;
  for (const row of rows) {
    if (!postCommentsCache.has(row.postId)) {
      const allPostComments = await listCommentsForPost(row.postId);
      const childrenMap = new Map<string, string[]>();
      for (const item of allPostComments) {
        if (item.parentCommentId) {
          const list = childrenMap.get(item.parentCommentId) || [];
          list.push(item.id);
          childrenMap.set(item.parentCommentId, list);
        }
      }
      const memo = new Map<string, number>();
      const countDescendants = (id: string): number => {
        if (memo.has(id)) return memo.get(id)!;
        const children = childrenMap.get(id) || [];
        let total = children.length;
        for (const childId of children) {
          total += countDescendants(childId);
        }
        memo.set(id, total);
        return total;
      };
      for (const item of allPostComments) {
        countDescendants(item.id);
      }
      postCommentsCache.set(row.postId, memo);
    }
    const memoMap = postCommentsCache.get(row.postId)!;
    enriched.push({
      ...row,
      likeCount: await countReactionsForTarget("comment", row.id),
      liked: viewerId ? Boolean(await getReaction({ userAccountId: viewerId, targetType: "comment", targetId: row.id })) : false,
      replyCount: memoMap.get(row.id) ?? 0,
    });
  }
  return enriched;
}
