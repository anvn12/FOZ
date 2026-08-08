/**
 * Feed ranking pure function.
 * Scores posts by affinity (viewer's interaction with author),
 * engagement (total reactions + comments), and recency decay.
 */

const W_AFFINITY = 0.5;
const W_ENGAGEMENT = 0.3;
const W_RECENCY = 0.2;
const HALF_LIFE_HOURS = 48;

export type RankedPost = {
  id: string;
  authorId: string;
  createdAt: Date | string;
  likeCount: number;
  commentCount: number;
  repostCount: number;
  [key: string]: unknown;
};

export type ViewerInteractionMap = Map<string, number>; // authorId → interaction count

/**
 * Recency score: 1 / (1 + hours / HALF_LIFE).
 * Newer posts → closer to 1, older posts → closer to 0.
 */
export function recencyScore(createdAt: Date | string): number {
  const hours = (Date.now() - new Date(createdAt).getTime()) / 3600_000;
  return 1 / (1 + hours / HALF_LIFE_HOURS);
}

/**
 * Engagement score: normalized total of likes + comments + reposts.
 * Capped at 100 to prevent viral posts from dominating.
 */
export function engagementScore(likeCount: number, commentCount: number, repostCount: number): number {
  const raw = likeCount + commentCount + repostCount;
  return Math.min(raw, 100) / 100;
}

/**
 * Score a single post for a viewer.
 * If viewerInteractions is empty (cold start), affinity = 0 → popularity-based.
 */
export function scorePost(
  post: RankedPost,
  viewerInteractions: ViewerInteractionMap,
): number {
  const affinity = viewerInteractions.get(post.authorId) ?? 0;
  const engagement = engagementScore(post.likeCount, post.commentCount, post.repostCount);
  const recency = recencyScore(post.createdAt);

  return (affinity * W_AFFINITY) + (engagement * W_ENGAGEMENT) + (recency * W_RECENCY);
}

/**
 * Score and sort posts descending by score.
 * Returns a new array; does not mutate input.
 */
export function rankPosts(
  posts: RankedPost[],
  viewerInteractions: ViewerInteractionMap,
): RankedPost[] {
  return posts
    .map((post) => ({ ...post, _score: scorePost(post, viewerInteractions) }))
    .sort((a, b) => b._score - a._score);
}

/**
 * Build viewer interaction map: count of viewer's reactions + comments
 * grouped by post author. Used as affinity signal.
 */
export function buildViewerInteractionMap(
  viewerReactions: Array<{ targetType: string; targetId: string }>,
  viewerComments: Array<{ postId: string }>,
  postAuthorMap: Map<string, string>, // postId → authorId
): ViewerInteractionMap {
  const map: ViewerInteractionMap = new Map();

  for (const r of viewerReactions) {
    const authorId = postAuthorMap.get(r.targetId);
    if (authorId) map.set(authorId, (map.get(authorId) ?? 0) + 1);
  }

  for (const c of viewerComments) {
    const authorId = postAuthorMap.get(c.postId);
    if (authorId) map.set(authorId, (map.get(authorId) ?? 0) + 1);
  }

  return map;
}
