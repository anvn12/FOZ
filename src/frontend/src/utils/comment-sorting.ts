export type SortMode = "top" | "recent";

export interface CommentSortableItem {
  id: string;
  createdAt: Date | string;
  likeCount?: number;
  replyCount?: number;
  authorId?: string;
  parentCommentId?: string | null;
  [key: string]: unknown;
}

const HALF_LIFE_HOURS = 48;

/**
 * Recency score: 1 / (1 + hours / HALF_LIFE).
 * Newer comments → closer to 1, older comments → closer to 0.
 */
export function commentRecencyScore(createdAt: Date | string): number {
  const time = new Date(createdAt).getTime();
  if (isNaN(time)) return 0;
  const hours = (Date.now() - time) / 3600_000;
  return 1 / (1 + Math.max(0, hours) / HALF_LIFE_HOURS);
}

/**
 * Engagement score: normalized total of likes + replies.
 * Capped at 100 to prevent runaway scores.
 */
export function commentEngagementScore(likeCount = 0, replyCount = 0): number {
  const raw = (likeCount || 0) + (replyCount || 0);
  return Math.min(raw, 100) / 100;
}

/**
 * Score a single comment.
 * Ranking algorithm matches post feed ranking: engagement (weight 0.3) + recency (weight 0.2) + optional affinity (weight 0.5).
 */
export function scoreComment(comment: CommentSortableItem, viewerInteractions?: Map<string, number>): number {
  const affinity = viewerInteractions && comment.authorId ? (viewerInteractions.get(comment.authorId) ?? 0) : 0;
  const engagement = commentEngagementScore(comment.likeCount, comment.replyCount);
  const recency = commentRecencyScore(comment.createdAt);

  return (affinity * 0.5) + (engagement * 0.3) + (recency * 0.2);
}

/**
 * Sort comments according to mode:
 * - "top": descending by score (engagement + recency), secondary by createdAt descending, tertiary by id.
 * - "recent": descending by createdAt (newest first), secondary by id.
 *
 * Does not mutate the input array.
 */
export function sortComments<T extends CommentSortableItem>(
  comments: T[],
  mode: SortMode,
  viewerInteractions?: Map<string, number>,
): T[] {
  const clone = [...comments];
  if (mode === "recent") {
    return clone.sort((a, b) => {
      const timeA = new Date(a.createdAt).getTime();
      const timeB = new Date(b.createdAt).getTime();
      if (timeB !== timeA) return timeB - timeA;
      return b.id.localeCompare(a.id);
    });
  }

  // "top" mode
  return clone
    .map((item) => ({ item, _score: scoreComment(item, viewerInteractions) }))
    .sort((a, b) => {
      if (b._score !== a._score) return b._score - a._score;
      const timeA = new Date(a.item.createdAt).getTime();
      const timeB = new Date(b.item.createdAt).getTime();
      if (timeB !== timeA) return timeB - timeA;
      return b.item.id.localeCompare(a.item.id);
    })
    .map(({ item }) => item);
}
