import type { CreatePostRequest, UpdatePostRequest } from "#shared/schemas/interactions.js";
import { db } from "#backend/db/client.js";
import { posts } from "#backend/db/schema/interactions.js";
import { and, eq, isNull } from "drizzle-orm";
import { getPostById, listPosts, countReactionsForTarget, getReaction } from "#backend/db/repositories/interactions.js";

export async function createPost(authorId: string, input: CreatePostRequest) {
  const [row] = await db
    .insert(posts)
    .values({
      authorId,
      body: input.body,
      visibilityState: "public",
      lifecycleState: "active",
    })
    .returning();
  return row;
}

export async function updatePostBody(postId: string, authorId: string, input: UpdatePostRequest) {
  const [row] = await db
    .update(posts)
    .set({ body: input.body, updatedAt: new Date() })
    .where(and(eq(posts.id, postId), eq(posts.authorId, authorId), isNull(posts.deletedAt)))
    .returning();
  if (!row) {
    const existing = await getPostById(postId);
    if (!existing) throw new Error("POST_NOT_FOUND");
    throw new Error("POST_FORBIDDEN");
  }
  return row;
}

export async function deletePost(postId: string, authorId: string) {
  const [row] = await db
    .update(posts)
    .set({ lifecycleState: "hidden", visibilityState: "hidden", deletedAt: new Date(), updatedAt: new Date() })
    .where(and(eq(posts.id, postId), eq(posts.authorId, authorId), isNull(posts.deletedAt)))
    .returning();
  if (!row) {
    const existing = await getPostById(postId);
    if (!existing) throw new Error("POST_NOT_FOUND");
    throw new Error("POST_FORBIDDEN");
  }
  return { ok: true as const };
}

export async function listPostFeed(viewerId?: string) {
  const rows = await listPosts();
  const enriched = [] as Array<(typeof rows)[number] & { likeCount: number; liked: boolean }>;
  for (const row of rows) {
    enriched.push({
      ...row,
      likeCount: await countReactionsForTarget("post", row.id),
      liked: viewerId ? Boolean(await getReaction({ userAccountId: viewerId, targetType: "post", targetId: row.id })) : false,
    });
  }
  return enriched;
}
