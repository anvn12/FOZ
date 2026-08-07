import { db } from "#backend/db/client.js";
import { hashtags, postHashtags } from "../schema/hashtags.js";
import { posts } from "../schema/interactions.js";
import { eq, sql, desc, gte, and, isNull } from "drizzle-orm";

export function parseHashtagsFromText(text: string): string[] {
  if (!text) return [];
  const matches = text.match(/#([a-zA-Z0-9_]+)/g);
  if (!matches) return [];
  
  // Deduplicate case-insensitively while preserving first occurrence casing
  const uniqueTagsMap = new Map<string, string>();
  for (const rawTag of matches) {
    const cleanTag = rawTag.slice(1);
    if (!cleanTag) continue;
    const lower = cleanTag.toLowerCase();
    if (!uniqueTagsMap.has(lower)) {
      uniqueTagsMap.set(lower, cleanTag);
    }
  }
  return Array.from(uniqueTagsMap.values());
}

export async function extractHashtagsAndSync(postId: string, text: string): Promise<void> {
  const extractedTags = parseHashtagsFromText(text);
  if (extractedTags.length === 0) return;

  for (const displayTag of extractedTags) {
    const lowerName = displayTag.toLowerCase();

    // 1. Find or insert hashtag
    let hashtagRecord = await db
      .select({ id: hashtags.id })
      .from(hashtags)
      .where(eq(hashtags.name, lowerName))
      .limit(1)
      .then((rows: Array<{ id: string }>) => rows[0]);

    if (!hashtagRecord) {
      const [inserted] = await db
        .insert(hashtags)
        .values({
          name: lowerName,
          displayName: displayTag,
        })
        .onConflictDoNothing({ target: hashtags.name })
        .returning({ id: hashtags.id });

      if (inserted) {
        hashtagRecord = inserted;
      } else {
        // Fallback query if conflict raced
        hashtagRecord = await db
          .select({ id: hashtags.id })
          .from(hashtags)
          .where(eq(hashtags.name, lowerName))
          .limit(1)
          .then((rows: Array<{ id: string }>) => rows[0]);
      }
    }

    if (hashtagRecord) {
      // 2. Link in post_hashtags junction table
      await db
        .insert(postHashtags)
        .values({
          postId,
          hashtagId: hashtagRecord.id,
        })
        .onConflictDoNothing();
    }
  }
}

export async function getPostsByHashtag(tag: string, limit = 20, cursor?: string, viewerId?: string) {
  const lowerTag = tag.toLowerCase();

  const targetHashtag = await db
    .select({ id: hashtags.id })
    .from(hashtags)
    .where(eq(hashtags.name, lowerTag))
    .limit(1)
    .then((rows: Array<{ id: string }>) => rows[0]);

  if (!targetHashtag) {
    return { items: [], nextCursor: null };
  }

  const queryConditions = [
    eq(postHashtags.hashtagId, targetHashtag.id),
    eq(posts.visibilityState, "public"),
    isNull(posts.deletedAt),
  ];
  if (cursor) {
    queryConditions.push(sql`${posts.createdAt} < ${new Date(cursor)}`);
  }

  const rows = await db
    .select({
      id: posts.id,
      authorId: posts.authorId,
      content: posts.content,
      parentId: posts.parentId,
      repostOfId: posts.repostOfId,
      visibilityState: posts.visibilityState,
      lifecycleState: posts.lifecycleState,
      createdAt: posts.createdAt,
      updatedAt: posts.updatedAt,
    })
    .from(posts)
    .innerJoin(postHashtags, eq(posts.id, postHashtags.postId))
    .where(and(...queryConditions))
    .orderBy(desc(posts.createdAt))
    .limit(limit + 1);

  const hasNextPage = rows.length > limit;
  const rawItems = hasNextPage ? rows.slice(0, limit) : rows;
  const lastItem = rawItems[rawItems.length - 1];
  const nextCursor = hasNextPage && lastItem ? lastItem.createdAt.toISOString() : null;

  const { enrichPostList } = await import("#backend/services/interactions/posts.js");
  const items = await enrichPostList(rawItems, viewerId);

  return { items, nextCursor };
}

export async function getTrendingHashtags(limit = 10) {
  const sevenDaysAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);

  const rows = await db
    .select({
      id: hashtags.id,
      name: hashtags.name,
      displayName: hashtags.displayName,
      postCount: sql<number>`count(${postHashtags.postId})::int`,
    })
    .from(hashtags)
    .innerJoin(postHashtags, eq(hashtags.id, postHashtags.hashtagId))
    .innerJoin(posts, eq(postHashtags.postId, posts.id))
    .where(and(gte(posts.createdAt, sevenDaysAgo), eq(posts.visibilityState, "public"), isNull(posts.deletedAt)))
    .groupBy(hashtags.id, hashtags.name, hashtags.displayName)
    .orderBy(desc(sql`count(${postHashtags.postId})`))
    .limit(limit);

  return rows;
}
