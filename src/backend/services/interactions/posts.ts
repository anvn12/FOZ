import type { CreatePostRequest, UpdatePostRequest } from "#shared/schemas/interactions.js";
import { db } from "#backend/db/client.js";
import { posts, postAttachments } from "#backend/db/schema/interactions.js";
import { and, eq, isNull } from "drizzle-orm";
import { getPostById, listPosts, countReactionsForTarget, countCommentsForPost, getReaction } from "#backend/db/repositories/interactions.js";
import { getProfileByUserId } from "#backend/api/profile/profile.service.js";

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
        postToEnrich = { ...(original as any), repostId: row.id };
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
