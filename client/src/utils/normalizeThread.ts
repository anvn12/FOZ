import type { Thread } from "../types";

/** Partial thread from POST /threads or other write paths */
export type ThreadLike = Partial<Thread> &
  Pick<Thread, "id" | "content" | "likeCount" | "replyCount" | "createdAt" | "author">;

export function normalizeThreadForFeed(partial: ThreadLike): Thread {
  return {
    id: partial.id,
    content: partial.content,
    imageUrl: partial.imageUrl ?? null,
    likeCount: partial.likeCount,
    replyCount: partial.replyCount,
    createdAt: partial.createdAt,
    author: partial.author,
    replies: partial.replies ?? [],
    likedByMe: partial.likedByMe ?? false,
    followingAuthor: partial.followingAuthor ?? false,
  };
}
